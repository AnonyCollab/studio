
'use client';

import { UserPlus, Crown, Shield, Users as UsersIcon } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { UserProfileTrigger } from './ProfileCard';
import { useFirestore, useCollection, useMemoFirebase, useUser } from '@/firebase';
import { collection, doc, documentId, query, where, getDoc, onSnapshot } from 'firebase/firestore';
import { useState, useEffect } from 'react';
import { InviteDialog } from './InviteDialog';

interface Member {
  id: string;
  displayName: string;
  photoURL: string;
  role: 'owner' | 'admin' | 'moderator' | 'member';
  status: 'online' | 'idle' | 'offline';
}

const roleConfig = {
  owner: {
    label: 'Owner',
    color: '#ef4444',
    icon: Crown,
  },
  admin: {
    label: 'Admins',
    color: '#f97316',
    icon: Shield,
  },
  moderator: {
    label: 'Moderators',
    color: '#22d3ee',
    icon: Shield,
  },
  member: {
    label: 'Members',
    color: '#94a3b8',
    icon: UsersIcon,
  },
};

interface MembersPanelProps {
  theme: 'light' | 'dark';
  serverId: string;
}

export function MembersPanel({ theme, serverId }: MembersPanelProps) {
  const isDark = theme === 'dark';
  const firestore = useFirestore();
  const { user: currentUser } = useUser();
  const [members, setMembers] = useState<Member[]>([]);
  const [server, setServer] = useState<any>(null);
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const isOwner = server?.ownerId === currentUser?.uid;

  useEffect(() => {
    if (!firestore || !serverId) return;

    const serverRef = doc(firestore, 'servers', serverId);

    const unsubServer = onSnapshot(serverRef, (serverDoc) => {
        if(serverDoc.exists()) {
            setServer({ id: serverDoc.id, ...serverDoc.data() });
            const memberIds = serverDoc.data().members || [];
            if (memberIds.length > 0) {
              const usersQuery = query(collection(firestore, 'users'), where(documentId(), 'in', memberIds));
              
              const unsubUsers = onSnapshot(usersQuery, (snapshot) => {
                const fetchedMembers = snapshot.docs.map(doc => {
                  const profile = doc.data().profile;
                  let role: Member['role'] = 'member';
                  if (doc.id === serverDoc.data().ownerId) {
                    role = 'owner';
                  }
                  
                  return {
                    id: doc.id,
                    displayName: profile.displayName,
                    photoURL: profile.photoURL,
                    role: role,
                    status: 'online'
                  } as Member;
                });
                setMembers(fetchedMembers);
              });
              return unsubUsers;
            }
        }
        setMembers([]);
        return () => {};
    });

    return () => {
      unsubServer();
    };
  }, [firestore, serverId]);

  const membersByRole = {
    owner: members.filter((m) => m.role === 'owner'),
    admin: members.filter((m) => m.role === 'admin'),
    moderator: members.filter((m) => m.role === 'moderator'),
    member: members.filter((m) => m.role === 'member'),
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online':
        return 'bg-emerald-500';
      case 'idle':
        return 'bg-yellow-500';
      case 'dnd':
        return 'bg-red-500';
      case 'offline':
        return 'bg-gray-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <>
    <div className={`w-60 flex flex-col ${isDark ? 'bg-[#0a0e1a] border-l border-white/10' : 'bg-white border-l border-gray-200'}`}>
      {/* Header with invite button */}
      <div className={`p-3 ${isDark ? 'bg-[#131823] border-b border-white/10' : 'bg-white border-b border-gray-200'}`}>
        <button 
            onClick={() => setIsInviteOpen(true)}
            disabled={!isOwner}
            className={`w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg transition-all text-sm font-medium ${
            isOwner
                ? (isDark ? 'bg-[#22d3ee] hover:bg-cyan-500 text-white' : 'bg-cyan-600 hover:bg-cyan-700 text-white')
                : (isDark ? 'bg-white/10 text-gray-500 cursor-not-allowed' : 'bg-gray-200 text-gray-400 cursor-not-allowed')
            }`}>
          <UserPlus className="w-4 h-4" />
          Invite People
        </button>
      </div>

      {/* Members list */}
      <ScrollArea className="flex-1">
        <div className="p-3 space-y-4">
          {(Object.keys(membersByRole) as Array<keyof typeof membersByRole>).map((roleKey) => {
            const roleMembers = membersByRole[roleKey];
            if (roleMembers.length === 0) return null;

            const config = roleConfig[roleKey];
            const RoleIcon = config.icon;

            return (
              <div key={roleKey}>
                <div className="flex items-center gap-2 px-2 py-1 mb-2">
                  <RoleIcon className="w-3 h-3" style={{ color: config.color }} />
                  <span
                    className="text-xs tracking-wider uppercase"
                    style={{ color: config.color }}
                  >
                    {config.label} — {roleMembers.length}
                  </span>
                </div>
                <div className="space-y-1">
                  {roleMembers.map((member) => {
                    return (
                      <div
                          key={member.id}
                          className={`flex items-center gap-3 px-2 py-1.5 rounded group transition-all cursor-pointer ${
                            isDark
                              ? 'hover:bg-white/5'
                              : 'hover:bg-gray-100'
                          }`}
                        >
                          <div className="relative flex-shrink-0">
                            <Avatar className={`w-8 h-8 ${isDark ? 'ring-1 ring-white/10' : 'ring-1 ring-gray-200'}`}>
                              <AvatarImage src={member.photoURL} />
                              <AvatarFallback>{member.displayName[0]}</AvatarFallback>
                            </Avatar>
                            <div
                              className={`absolute bottom-0 right-0 w-3 h-3 rounded-full ${getStatusColor(
                                member.status
                              )} ${isDark ? 'border-2 border-[#0a0e1a]' : 'border-2 border-white'}`}
                            />
                          </div>
                          <span
                            className={`text-sm truncate flex-1 ${
                              isDark ? 'text-[#e5e7eb] group-hover:text-white' : 'text-gray-900'
                            }`}
                            style={{
                              color: member.role !== 'member' ? config.color : undefined,
                            }}
                          >
                            {member.displayName}
                          </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </ScrollArea>
    </div>
    <InviteDialog 
        isOpen={isInviteOpen} 
        onOpenChange={setIsInviteOpen} 
        theme={theme}
        serverId={serverId}
        currentMembers={members.map(m => m.id)}
    />
    </>
  );
}
