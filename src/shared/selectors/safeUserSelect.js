export const safeUserSelect = {
  id: true,
  email: true,
  roleId: true,
  profile: {
    select: {
      fullName: true,
      avatarUrl: true
    }
  }
};
