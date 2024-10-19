import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export const useScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    const mainContent = document?.querySelector("main");

    if (mainContent) {
      mainContent.scrollTop = 0;
    }
  }, [pathname]);
};
