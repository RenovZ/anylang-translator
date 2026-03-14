import { createAvatar } from '@dicebear/core';
import { initials } from '@dicebear/collection';

import { hashCode } from './hash';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const dicebear = (username: string | undefined, options = {}, style: any = undefined) => {
  const defaultOptions = { seed: username };
  const avatar = createAvatar(initials, {
    ...options,
    ...defaultOptions
  });
  return avatar.toDataUri();
};

export default {
  dicebear
};
