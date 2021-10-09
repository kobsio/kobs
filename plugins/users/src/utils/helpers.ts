import md5 from 'md5';

export const getGravatarImageUrl = (email: string, size: number): string => {
  return 'https://secure.gravatar.com/avatar/' + md5(email.toLowerCase().trim()) + '?size=' + size + '&default=mm';
};
