export const users = {
  thomas: {
    userId: 'thomas',
    name: 'Thomas',
    username: 'thomas',
    imageUrl: '/Assets/profile.png',
    roles: ['Owner'],
  },
};

export const defaultServer = {
  _id: 'default-server',
  name: 'The Server',
  image: '/Assets/server.png',
  owner: 'thomas',
  serverRoles: [
    {
      name: 'Owner',
      color: '#5865F2',
      access: {
        manageServer: true,
        manageChannels: true,
        manageRoles: true,
        manageUsers: true,
        manageMessages: true,
        manageVoice: true,
        manageEmojis: true,
      },
    },
    {
      name: 'Member',
      color: '#9ca3af',
      access: {
        manageServer: false,
        manageChannels: false,
        manageRoles: false,
        manageUsers: false,
        manageMessages: false,
        manageVoice: false,
        manageEmojis: false,
      },
    },
  ],
  serverUsers: Object.values(users),
  channels: [
    {
      _id: 'general-text',
      name: 'general',
      type: 'Text',
      systemMessages: true,
      access: { read: ['Owner', 'Member'], write: ['Owner', 'Member'] },
      messages: [],
    },
    {
      _id: 'general-voice',
      name: 'General Voice',
      type: 'Voice',
      systemMessages: false,
      access: { read: ['Owner', 'Member'], write: ['Owner', 'Member'] },
      voiceAccess: {
        connect: ['Owner', 'Member'],
        speak: ['Owner', 'Member'],
        video: ['Owner', 'Member'],
        screenShare: ['Owner', 'Member'],
        prioritySpeakers: ['Owner'],
      },
      userLimit: 0,
      bitrate: 'medium',
      messages: [],
    },
  ],
  logs: [],
}

export function getDefaultServer() {
  return JSON.parse(JSON.stringify(defaultServer))
}
