"use client"

import {
  CircleCheckIcon,
  InfoIcon,
  Loader2Icon,
  OctagonXIcon,
  TriangleAlertIcon,
} from "lucide-react"
import { useSyncExternalStore } from "react"
import { useTheme } from "next-themes"
import { Toaster as Sonner, type ToasterProps } from "sonner"

// Không có gì để lắng nghe: chỉ cần server trả false, client trả true.
const dangKyRong = () => () => {}

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  // useTheme() cho giá trị khác nhau giữa server và client (trong cây không có
  // ThemeProvider), nên nếu render thẳng thì cây DOM hai bên lệch và React vứt
  // bỏ kết quả hydrate — lỗi #418 xuất hiện ở MỌI trang. Chỉ dựng Toaster sau
  // khi đã mount; toast vốn chỉ hiện khi người dùng thao tác nên không mất gì.
  const daMount = useSyncExternalStore(dangKyRong, () => true, () => false)
  if (!daMount) return null

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      icons={{
        success: <CircleCheckIcon className="size-4" />,
        info: <InfoIcon className="size-4" />,
        warning: <TriangleAlertIcon className="size-4" />,
        error: <OctagonXIcon className="size-4" />,
        loading: <Loader2Icon className="size-4 animate-spin" />,
      }}
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
          "--border-radius": "var(--radius)",
        } as React.CSSProperties
      }
      {...props}
    />
  )
}

export { Toaster }
