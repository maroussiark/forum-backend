export const safeUserSelect = {
  id: true,
  email: true,
  roleId: true,
  userProfiles: {
    select: {
      fullName: true,
      avatarUrl: true
    }
  }
};
