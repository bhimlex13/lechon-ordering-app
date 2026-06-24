import { useEffect } from 'react';
import { branding } from '../config/branding';

const usePageTitle = (title) => {
  useEffect(() => {
    document.title = title ? `${title} | ${branding.name}` : branding.name;
  }, [title]);
};

export default usePageTitle;
