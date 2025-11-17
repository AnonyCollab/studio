import { Crown, ShieldCheck, Shield, Zap } from 'lucide-react';
import { UserProfile } from '../components/ProfileCard';

export const mockUsers: Record<string, UserProfile> = {
  'user1': {
    id: 'user1',
    username: 'alice_wonder',
    displayName: 'Alice Wonderland',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alice',
    status: 'online',
    customStatus: '🎨 Creating amazing designs',
    bio: 'UI/UX Designer passionate about creating beautiful and functional interfaces. Love working with React and Tailwind CSS!',
    joinDate: 'January 2023',
    roles: [
      { name: 'Owner', color: '#ef4444' },
      { name: 'Designer', color: '#a855f7' }
    ],
    badges: [
      { name: 'Server Owner', icon: Crown },
      { name: 'Early Supporter', icon: Zap }
    ],
    mutualServers: 3,
    mutualFriends: 12
  },
  'user2': {
    id: 'user2',
    username: 'bob_dev',
    displayName: 'Bob the Builder',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Bob',
    status: 'online',
    customStatus: '💻 Coding away...',
    bio: 'Full-stack developer | Coffee enthusiast | Open source contributor',
    joinDate: 'March 2023',
    roles: [
      { name: 'Admin', color: '#f97316' },
      { name: 'Developer', color: '#22d3ee' }
    ],
    badges: [
      { name: 'Admin', icon: ShieldCheck }
    ],
    mutualServers: 5,
    mutualFriends: 8
  },
  'user3': {
    id: 'user3',
    username: 'charlie_music',
    displayName: 'Charlie Notes',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Charlie',
    status: 'idle',
    customStatus: '🎵 Listening to some tunes',
    bio: 'Music producer and DJ. Always looking for new sounds and collaborations.',
    joinDate: 'February 2023',
    roles: [
      { name: 'Moderator', color: '#22d3ee' },
      { name: 'Artist', color: '#ec4899' }
    ],
    badges: [
      { name: 'Moderator', icon: Shield }
    ],
    mutualServers: 2,
    mutualFriends: 15
  },
  'user4': {
    id: 'user4',
    username: 'diana_gamer',
    displayName: 'Diana',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Diana',
    status: 'dnd',
    customStatus: '🎮 In ranked match - DND',
    bio: 'Professional gamer and streamer. Top 500 in multiple games.',
    joinDate: 'April 2023',
    roles: [
      { name: 'Member', color: '#6b7280' }
    ],
    mutualServers: 1,
    mutualFriends: 6
  },
  'user5': {
    id: 'user5',
    username: 'eve_artist',
    displayName: 'Eve',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Eve',
    status: 'online',
    bio: 'Digital artist | Illustrator | Available for commissions',
    joinDate: 'May 2023',
    roles: [
      { name: 'Member', color: '#6b7280' }
    ],
    mutualServers: 4,
    mutualFriends: 10
  },
  'user6': {
    id: 'user6',
    username: 'frank_writer',
    displayName: 'Frank Words',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Frank',
    status: 'offline',
    bio: 'Writer and storyteller. Working on my first novel.',
    joinDate: 'June 2023',
    roles: [
      { name: 'Member', color: '#6b7280' }
    ],
    mutualServers: 2,
    mutualFriends: 5
  },
  'currentUser': {
    id: 'currentUser',
    username: 'YourUsername',
    displayName: 'Your Display Name',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=You',
    status: 'online',
    customStatus: '✨ Building something awesome',
    bio: 'This is your profile! Click on Settings to customize your profile.',
    joinDate: 'December 2022',
    roles: [
      { name: 'Member', color: '#6b7280' }
    ],
    badges: [
      { name: 'Early Adopter', icon: Zap }
    ],
    mutualServers: 8,
    mutualFriends: 20
  }
};

// Helper function to get a random user
export function getRandomUser(): UserProfile {
  const userIds = Object.keys(mockUsers).filter(id => id !== 'currentUser');
  const randomId = userIds[Math.floor(Math.random() * userIds.length)];
  return mockUsers[randomId];
}
