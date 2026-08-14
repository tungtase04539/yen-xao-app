'use client';

import { useEffect, useState, type ReactNode } from 'react';

interface ViewportOnlyProps {
  /** Media query dùng để quyết định có mount children hay không. */
  query: string;
  children: ReactNode;
}

/**
 * Chỉ mount children khi viewport khớp `query`.
 *
 * Vì sao cần: hero của /gioi-thieu có hai phiên bản video (khối dọc cho mobile,
 * video nền cho desktop) nhưng dùng CHUNG một file MP4. Nếu chỉ ẩn bằng
 * `md:hidden` / `hidden md:block` thì cả hai thẻ <video preload="auto"> vẫn nằm
 * trong DOM và vẫn kéo file về — `display:none` không chặn media element buffer,
 * mà hai component còn chủ động gọi `.play()` kèm timer retry. Gate bằng
 * matchMedia để mỗi thiết bị chỉ tải đúng một video.
 */
export default function ViewportOnly({ query, children }: ViewportOnlyProps) {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia(query);
    const update = () => setMatches(mql.matches);
    update();
    mql.addEventListener('change', update);
    return () => mql.removeEventListener('change', update);
  }, [query]);

  return matches ? <>{children}</> : null;
}
