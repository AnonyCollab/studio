
'use client';

import * as React from "react";
import { useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { X, Upload, Briefcase, MessageSquare, Star, Sparkles, Image as ImageIcon, Trash2, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { Progress } from "@/components/ui/progress";
import Image from "next/image";
import { z } from 'zod';
import { useFirebaseApp, useFirestore, useUser } from "@/firebase";
import { usePosts } from "@/context/PostContext";
import { cn } from "@/lib/utils";
import { addPost } from "@/firebase/non-blocking-updates";
import { detailedSectorsData, SectorWithSubSectors, SubSector, findIndustryByName } from "@/app/data/naics";
import { Badge } from "@/components/ui/badge";
import { suggestNaicsCode } from '@/ai/flows/suggestNaicsCodeFlow';


const CreatePostSchema = z.object({
  postType: z.string(),
  title: z.string().min(1, "Title is required."),
  problemDetails: z.string().min(1, "Problem details are required.").optional(),
  problemSummary: z.string().max(100, "Summary must be 100 characters or less.").optional(),
  whatIveTried: z.string().optional(),
  whatIveTriedSummary: z.string().max(100, "Summary must be 100 characters or less.").optional(),
  expectedOutcome: z.string().optional(),
  expectedOutcomeSummary: z.string().max(100, "Summary must be 100 characters or less.").optional(),
  sector: z.string().min(1, "Sector is required."),
  tags: z.array(z.string()).min(1, "At least one tag is required."),
  imageUrl: z.string().optional(),
});
type CreatePostInput = z.infer<typeof CreatePostSchema>;

interface CreatePostProps {
  onClose: () => void;
  theme?: "light" | "dark";
}

export function CreatePost({ onClose, theme = "dark" }: CreatePostProps) {
  const [postType, setPostType] = useState("qa");
  const [activeTab, setActiveTab] = useState("problem");
  const [isSuggestingTags, setIsSuggestingTags] = useState(false);
  const [isSuggestingNaics, setIsSuggestingNaics] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const firebaseApp = useFirebaseApp();
  const firestore = useFirestore();
  const { user } = useUser();
  const { handleCloseDetail } = usePosts();
  const storage = getStorage(firebaseApp);

  const [selectedSectorCode, setSelectedSectorCode] = useState<string>("");
  const [selectedSubSectorCode, setSelectedSubSectorCode] = useState<string>("");

  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);

  const form = useForm<CreatePostInput>({
    resolver: zodResolver(CreatePostSchema),
    defaultValues: {
      postType: "qa",
      title: "",
      problemDetails: "",
      problemSummary: "",
      whatIveTried: "",
      whatIveTriedSummary: "",
      expectedOutcome: "",
      expectedOutcomeSummary: "",
      sector: "",
      tags: [],
      imageUrl: "",
    },
  });

  const { watch, setValue, getValues, trigger, control } = form;
  const imageUrl = watch("imageUrl");

  const availableSubSectors = useMemo(() => {
    if (!selectedSectorCode) return [];
    const sector = detailedSectorsData.find(s => s.code === selectedSectorCode);
    return sector ? sector.subSectors : [];
  }, [selectedSectorCode]);

  const availableIndustries = useMemo(() => {
    if (!selectedSubSectorCode) return [];
    const subSector = availableSubSectors.find(ss => ss.code === selectedSubSectorCode);
    return subSector ? subSector.industries : [];
  }, [selectedSubSectorCode, availableSubSectors]);


  const handleSuggestTags = async () => {
    setIsSuggestingTags(true);
    toast({
      variant: "destructive",
      title: "Not Implemented",
      description: "AI tag suggestions are currently unavailable.",
    });
    setIsSuggestingTags(false);
  };

  const handleSuggestNaics = async () => {
    const title = getValues("title");
    const problem = getValues("problemDetails");
    
    if (!title && !problem) {
      toast({
        variant: "destructive",
        title: "More Information Needed",
        description: "Please provide a title and problem details for an accurate suggestion.",
      });
      return;
    }

    setIsSuggestingNaics(true);
    try {
      const description = `Title: ${title}\n\nDetails: ${problem}`;
      const result = await suggestNaicsCode({ description });
      
      if (result && result.code) {
        const industryInfo = findIndustryByName(result.name);
        if (industryInfo && industryInfo.sector && industryInfo.subSector && industryInfo.industry) {
          // Trigger updates in sequence
          setSelectedSectorCode(industryInfo.sector.code);
          setValue("sector", industryInfo.sector.code, { shouldValidate: true });

          // We need to wait for the sub-sectors to become available
          setTimeout(() => {
            setSelectedSubSectorCode(industryInfo.subSector!.code);
            setValue("sector", industryInfo.subSector!.code, { shouldValidate: true });
            
            // And then for industries
            setTimeout(() => {
              setValue("sector", industryInfo.industry!.code, { shouldValidate: true });
              toast({ title: "AI Suggestion Applied!", description: `Industry set to: ${result.name}` });
            }, 100);
          }, 100);

        } else {
            toast({ variant: 'destructive', title: "Suggestion Error", description: "Could not map suggestion to form fields." });
        }
      } else {
        toast({ variant: 'destructive', title: "Suggestion Failed", description: "The AI could not determine an industry." });
      }
    } catch (error) {
      console.error("NAICS Suggestion Error:", error);
      toast({ variant: 'destructive', title: "AI Error", description: "An error occurred while fetching the suggestion." });
    } finally {
      setIsSuggestingNaics(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImagePreview(URL.createObjectURL(file));

    const storageRef = ref(storage, `posts/${Date.now()}_${file.name}`);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on('state_changed',
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setUploadProgress(progress);
      },
      (error) => {
        console.error("Upload failed:", error);
        toast({
          variant: "destructive",
          title: "Upload Failed",
          description: "There was an error uploading your image. Please try again.",
        });
        setUploadProgress(null);
        setImagePreview(null);
      },
      () => {
        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
          setValue("imageUrl", downloadURL);
          setUploadProgress(null);
           toast({
            title: "Upload Complete",
            description: "Your image has been successfully uploaded.",
          });
        });
      }
    );
  };
  
  const removeImage = () => {
      setValue("imageUrl", "");
      setImagePreview(null);
      if(fileInputRef.current) {
          fileInputRef.current.value = "";
      }
  };

  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const newTag = tagInput.trim();
      if (newTag && !tags.includes(newTag)) {
        const newTags = [...tags, newTag];
        setTags(newTags);
        setValue("tags", newTags, { shouldValidate: true });
        setTagInput("");
      }
    }
  };

  const removeTag = (tagToRemove: string) => {
    const newTags = tags.filter((tag) => tag !== tagToRemove);
    setTags(newTags);
    setValue("tags", newTags, { shouldValidate: true });
  };


  const onSubmit = async (data: CreatePostInput) => {
    if (!firestore) return;
    if (!user) {
        toast({
            variant: "destructive",
            title: "Not Authenticated",
            description: "You must be logged in to create a post.",
        });
        return;
    }
    try {
      await addPost(firestore, data, user);
      toast({
        title: "Post Created!",
        description: "Your post has been successfully created.",
      });
      handleCloseDetail();
    } catch(e) {
      console.error(e);
      toast({
        variant: "destructive",
        title: "Error",
        description: "There was an error creating your post.",
      });
    }
  };

  const isDark = theme === "dark";

  return (
    <div className={`h-full flex flex-col ${isDark ? "bg-[#0a0e1a]" : "bg-gray-50"}`}>
      {/* Header */}
      <div className={`flex items-center justify-between p-6 border-b ${isDark ? "border-white/10" : "border-gray-200"}`}>
        <h2 className={isDark ? "text-xl text-white" : "text-xl text-gray-900"}>Create New Post</h2>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className={isDark ? "text-gray-400 hover:text-white hover:bg-white/5" : "text-gray-500 hover:text-gray-900 hover:bg-gray-100"}
        >
          <X className="w-5 h-5" />
        </Button>
      </div>

      {/* Scrollable Form Content */}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex-1 overflow-y-auto custom-scrollbar">
          <div className="p-6 space-y-6">
            
            {/* Post Type Selection */}
             <FormField
              control={form.control}
              name="postType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className={isDark ? 'text-white' : 'text-gray-900'}>
                    What kind of post is this? <span className="text-red-500">*</span>
                  </FormLabel>
                   <FormControl>
                    <div className="grid grid-cols-3 gap-3 pt-2">
                      {(["general", "qa", "feedback"] as const).map((type) => (
                         <button
                          key={type}
                          type="button"
                          onClick={() => {
                            setPostType(type);
                            field.onChange(type);
                          }}
                          className={`flex items-center justify-center gap-2 p-4 rounded-lg border transition-all ${
                            postType === type
                              ? isDark ? "bg-cyan-400 text-gray-900 border-cyan-400" : "bg-cyan-600 text-white border-cyan-600"
                              : isDark ? "bg-transparent text-gray-400 border-white/10 hover:border-white/30" : "bg-transparent text-gray-600 border-gray-300 hover:border-gray-400"
                          }`}
                        >
                          {type === 'general' && <Briefcase className="w-4 h-4" />}
                          {type === 'qa' && <MessageSquare className="w-4 h-4" />}
                          {type === 'feedback' && <Star className="w-4 h-4" />}
                          {type.charAt(0).toUpperCase() + type.slice(1)} {type === 'qa' && ' & A'}
                        </button>
                      ))}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Title / Question */}
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className={isDark ? 'text-white' : 'text-gray-900'}>
                    Title / Question <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., Seeking expertise in B2B marketing automation"
                      className={isDark ? "bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-cyan-400/50" : "bg-gray-100 border-gray-300 text-gray-900 placeholder:text-gray-500 focus:border-cyan-500/50"}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Details Tabs */}
            <div>
              <FormLabel className={isDark ? 'text-white' : 'text-gray-900'}>
                Details
              </FormLabel>
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full mt-3">
                <TabsList className={`grid w-full grid-cols-3 border ${isDark ? "bg-white/5 border-white/10" : "bg-gray-100 border-gray-200"}`}>
                  <TabsTrigger value="problem" className={`text-sm ${isDark ? "text-gray-400 data-[state=active]:bg-white/10 data-[state=active]:text-white" : "text-gray-600 data-[state=active]:bg-white data-[state=active]:text-gray-900"}`}>Problem</TabsTrigger>
                  <TabsTrigger value="tried" className={`text-sm ${isDark ? "text-gray-400 data-[state=active]:bg-white/10 data-[state=active]:text-white" : "text-gray-600 data-[state=active]:bg-white data-[state=active]:text-gray-900"}`}>What I've Tried</TabsTrigger>
                  <TabsTrigger value="outcome" className={`text-sm ${isDark ? "text-gray-400 data-[state=active]:bg-white/10 data-[state=active]:text-white" : "text-gray-600 data-[state=active]:bg-white data-[state=active]:text-gray-900"}`}>Expected Outcome</TabsTrigger>
                </TabsList>
                <TabsContent value="problem" className="mt-3 space-y-4">
                   <FormField
                    control={form.control}
                    name="problemSummary"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Summary (max 100 chars)</FormLabel>
                        <FormControl>
                          <Textarea placeholder="A one-sentence summary of the problem." className={`min-h-[60px] ${isDark ? "bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-cyan-400/50" : "bg-gray-100 border-gray-300 text-gray-900 placeholder:text-gray-500 focus:border-cyan-500/50"}`} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                   <FormField
                    control={form.control}
                    name="problemDetails"
                    render={({ field }) => (
                      <FormItem>
                         <FormLabel className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Full Details</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Describe the problem in detail..." className={`min-h-[120px] ${isDark ? "bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-cyan-400/50" : "bg-gray-100 border-gray-300 text-gray-900 placeholder:text-gray-500 focus:border-cyan-500/50"}`} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </TabsContent>
                <TabsContent value="tried" className="mt-3 space-y-4">
                   <FormField
                    control={form.control}
                    name="whatIveTriedSummary"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Summary (max 100 chars)</FormLabel>
                        <FormControl>
                          <Textarea placeholder="A one-sentence summary of what you've tried." className={`min-h-[60px] ${isDark ? "bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-cyan-400/50" : "bg-gray-100 border-gray-300 text-gray-900 placeholder:text-gray-500 focus:border-cyan-500/50"}`} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                   <FormField
                    control={form.control}
                    name="whatIveTried"
                    render={({ field }) => (
                       <FormItem>
                        <FormLabel className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Full Details</FormLabel>
                        <FormControl>
                           <Textarea placeholder="What have you already tried to solve this?" className={`min-h-[120px] ${isDark ? "bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-cyan-400/50" : "bg-gray-100 border-gray-300 text-gray-900 placeholder:text-gray-500 focus:border-cyan-500/50"}`} {...field} />
                        </FormControl>
                         <FormMessage />
                       </FormItem>
                    )}
                  />
                </TabsContent>
                <TabsContent value="outcome" className="mt-3 space-y-4">
                  <FormField
                    control={form.control}
                    name="expectedOutcomeSummary"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Summary (max 100 chars)</FormLabel>
                        <FormControl>
                          <Textarea placeholder="A one-sentence summary of your desired outcome." className={`min-h-[60px] ${isDark ? "bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-cyan-400/50" : "bg-gray-100 border-gray-300 text-gray-900 placeholder:text-gray-500 focus:border-cyan-500/50"}`} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="expectedOutcome"
                    render={({ field }) => (
                       <FormItem>
                        <FormLabel className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Full Details</FormLabel>
                        <FormControl>
                           <Textarea placeholder="What is the ideal outcome you're looking for?" className={`min-h-[120px] ${isDark ? "bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-cyan-400/50" : "bg-gray-100 border-gray-300 text-gray-900 placeholder:text-gray-500 focus:border-cyan-500/50"}`} {...field} />
                        </FormControl>
                         <FormMessage />
                       </FormItem>
                    )}
                  />
                </TabsContent>
              </Tabs>
            </div>

            {/* Images */}
            <div>
              <FormLabel className={isDark ? 'text-white' : 'text-gray-900'}>
                Image (Optional)
              </FormLabel>
              <div className="mt-3">
                {imagePreview ? (
                  <div className="relative group w-full max-w-xs">
                    <Image
                      src={imagePreview}
                      alt="Image preview"
                      width={400}
                      height={225}
                      className="rounded-lg object-cover w-full aspect-video"
                    />
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-lg">
                      <Button type="button" variant="destructive" size="icon" onClick={removeImage}>
                        <Trash2 className="w-5 h-5" />
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                      className={`flex items-center gap-2 transition-all ${isDark ? "border-white/10 text-gray-400 hover:border-white/30 hover:text-white" : "border-gray-300 text-gray-600 hover:border-gray-400 hover:text-gray-800"}`}
                    >
                      <Upload className="w-4 h-4" />
                      Upload Image
                    </Button>
                    <Input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleImageUpload}
                      className="hidden"
                      accept="image/png, image/jpeg, image/gif"
                    />
                  </>
                )}
                {uploadProgress !== null && (
                  <div className="mt-2 space-y-1">
                     <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Uploading...</p>
                     <Progress value={uploadProgress} className="w-full h-2" />
                  </div>
                )}
              </div>
            </div>

            {/* Sector */}
            <FormField
              control={form.control}
              name="sector"
              render={({ field }) => (
                <FormItem className="space-y-4">
                  <div className="flex items-center justify-between">
                    <FormLabel className={isDark ? 'text-white' : 'text-gray-900'}>
                      Sector <span className="text-red-500">*</span>
                    </FormLabel>
                     <Button type="button" variant="link" size="sm" onClick={handleSuggestNaics} disabled={isSuggestingNaics} className="text-cyan-400 p-0 h-auto">
                      <Sparkles className="w-3.5 h-3.5 mr-1" />
                      {isSuggestingNaics ? 'Suggesting...' : 'AI Suggest'}
                    </Button>
                  </div>
                  
                  <Select onValueChange={(value) => {
                      setSelectedSectorCode(value);
                      setSelectedSubSectorCode("");
                      field.onChange(value); // Keep top-level sector as fallback
                      trigger("sector");
                  }} value={selectedSectorCode}>
                    <FormControl>
                      <SelectTrigger className={isDark ? "bg-white/5 border-white/10 text-white" : "bg-gray-100 border-gray-300 text-gray-900"}>
                        <SelectValue placeholder="Select a main sector" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className={isDark ? "bg-[#1a1f2e] border-white/10 text-white" : "bg-white border-gray-200 text-gray-900"}>
                      {detailedSectorsData.map((sector) => (
                        <SelectItem key={sector.code} value={sector.code} className={isDark ? "focus:bg-white/10" : "focus:bg-gray-100"}>
                          {sector.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {availableSubSectors.length > 0 && (
                    <Select onValueChange={(value) => {
                        setSelectedSubSectorCode(value);
                        field.onChange(value); // Update form value to sub-sector
                        trigger("sector");
                    }} value={selectedSubSectorCode}>
                        <FormControl>
                            <SelectTrigger className={isDark ? "bg-white/5 border-white/10 text-white" : "bg-gray-100 border-gray-300 text-gray-900"}>
                                <SelectValue placeholder="Select a sub-sector" />
                            </SelectTrigger>
                        </FormControl>
                        <SelectContent className={isDark ? "bg-[#1a1f2e] border-white/10 text-white" : "bg-white border-gray-200 text-gray-900"}>
                            {availableSubSectors.map((subSector) => (
                                <SelectItem key={subSector.code} value={subSector.code} className={isDark ? "focus:bg-white/10" : "focus:bg-gray-100"}>
                                    {subSector.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                  )}

                  {availableIndustries.length > 0 && (
                    <Select onValueChange={(value) => {
                        field.onChange(value); // Update form value to industry
                        trigger("sector");
                    }} value={field.value}>
                        <FormControl>
                            <SelectTrigger className={isDark ? "bg-white/5 border-white/10 text-white" : "bg-gray-100 border-gray-300 text-gray-900"}>
                                <SelectValue placeholder="Select an industry" />
                            </SelectTrigger>
                        </FormControl>
                        <SelectContent className={isDark ? "bg-[#1a1f2e] border-white/10 text-white" : "bg-white border-gray-200 text-gray-900"}>
                           {availableIndustries.map((industry) => (
                                <SelectItem key={industry.code} value={industry.code} className={isDark ? "focus:bg-white/10" : "focus:bg-gray-100"}>
                                    {industry.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                  )}

                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Tags */}
             <FormField
              control={form.control}
              name="tags"
              render={() => (
                <FormItem>
                   <div className="flex items-center justify-between">
                    <FormLabel className={isDark ? 'text-white' : 'text-gray-900'}>Tags <span className="text-red-500">*</span></FormLabel>
                    <Button type="button" variant="link" size="sm" onClick={handleSuggestTags} disabled={isSuggestingTags} className="text-cyan-400 p-0 h-auto">
                      <Sparkles className="w-3.5 h-3.5 mr-1" />
                      {isSuggestingTags ? 'Suggesting...' : 'AI Suggest'}
                    </Button>
                  </div>
                  <FormControl>
                    <div className={cn("flex flex-wrap items-center gap-2 rounded-md border p-2", isDark ? "bg-white/5 border-white/10" : "bg-gray-100 border-gray-300")}>
                       {tags.map((tag) => (
                          <Badge
                            key={tag}
                            variant="secondary"
                            className={cn("flex items-center gap-1.5", isDark ? "bg-cyan-500/20 text-cyan-300 border-cyan-500/30" : "bg-cyan-100 text-cyan-700 border-cyan-300" )}
                          >
                            {tag}
                            <button
                              type="button"
                              onClick={() => removeTag(tag)}
                              className="rounded-full hover:bg-black/20"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </Badge>
                        ))}
                      <Input
                        placeholder={tags.length === 0 ? "Add tags..." : "Add more..."}
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyDown={handleTagKeyDown}
                        className={cn("flex-1 bg-transparent border-none focus-visible:ring-0 focus-visible:ring-offset-0 p-0 h-auto", isDark ? "text-white placeholder:text-gray-500" : "text-gray-900 placeholder:text-gray-500")}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Action Buttons */}
          <div className={`flex items-center justify-end gap-3 p-6 border-t ${isDark ? "border-white/10" : "border-gray-200"} sticky bottom-0 ${isDark ? 'bg-[#0a0e1a]' : 'bg-white'}`}>
            <Button type="button" variant="ghost" onClick={onClose} className={isDark ? "text-gray-400 hover:text-white hover:bg-white/5" : "text-gray-500 hover:text-gray-900 hover:bg-gray-100"}>
              Cancel
            </Button>
            <Button type="submit" disabled={form.formState.isSubmitting || uploadProgress !== null} className={isDark ? "bg-cyan-400 hover:bg-cyan-500 text-gray-900" : "bg-cyan-600 hover:bg-cyan-700 text-white"}>
              {form.formState.isSubmitting ? "Submitting..." : "Submit Post"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}

    