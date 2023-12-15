import { usePathname, useRouter } from "next/navigation";
import { View, useTheme } from "@aws-amplify/ui-react";
import { LucideIcon } from "lucide-react";

import { cn } from "@/utils/cn";

interface SidebarItemProps {
  icon: LucideIcon;
  label: string;
  href: string;
}

export const SidebarItem = ({ icon: Icon, label, href }: SidebarItemProps) => {
  const { tokens } = useTheme();
  const pathname = usePathname();
  const router = useRouter();

  const isActive =
    (pathname === "/" && href === "/") ||
    pathname === href ||
    pathname?.startsWith(`${href}/`);

  const onClick = () => {
    router.push(href);
  };

  return (
    <View
      as="button"
      onClick={onClick}
      type="button"
      className={cn(
        "flex items-center gap-x-2 text-sm font-[500] transition-all hover:bg-slate-300/10"
      )}
      color={isActive ? tokens.colors.primary[80] : tokens.colors.primary[100]}
      backgroundColor={
        isActive ? tokens.colors.primary[10] : tokens.colors.primary[0]
      }
    >
      <View className="pl-6 flex items-center gap-x-2 py-4">
        <Icon size={22} />
        {label}
      </View>
      <View
        className={cn(
          "ml-auto opacity-0 border-2 h-full transition-all rounded-full",
          isActive && "md:opacity-100"
        )}
        borderColor={
          isActive ? tokens.colors.primary[80] : tokens.colors.primary[100]
        }
      />
    </View>
  );
};
