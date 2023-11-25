import { usePathname } from "next/navigation";
import Link from "next/link";
import { Button } from "@aws-amplify/ui-react";
import { LogOut } from "lucide-react";

import { UserButton } from "./user-button";

export const NavbarRoutes = () => {
  const pathname = usePathname();

  const isTeacherPage = pathname?.startsWith("/teacher");
  const isPlayerPage = pathname?.includes("/chapter");

  return (
    <div className="flex gap-2 ml-auto items-center">
      {isTeacherPage || isPlayerPage ? (
        <Link href="/">
          <Button variation="link" colorTheme="overlay" size="small">
            <LogOut className="h-4 w-4 mr-2" />
            Exit
          </Button>
        </Link>
      ) : (
        <Link href="/teacher/courses">
          <Button variation="link" colorTheme="overlay" size="small">
            Teacher mode
          </Button>
        </Link>
      )}
      <UserButton />
    </div>
  );
};
