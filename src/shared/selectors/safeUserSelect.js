export const safeUserSelect = {
  id: true,
  email: true,
  roleId: true,
  blockedAt: true,
  deletedAt: true,
  createdAt: true,
  role: {
    select: {
      id: true,
      name: true
    }
  },
  profile: {
    select: {
      fullName: true,
      avatarUrl: true
    }
  }
};
