import { Menu, View } from "@aws-amplify/ui-react";
import { Menu as MenuIcon } from "lucide-react";

import { Sidebar } from "./sidebar";

export const MobileSidebar = () => {
  return (
    <View width="4rem">
      <Menu
        trigger={
          <div className="md:hidden py-2.5 hover:opacity-75 transtion">
            <MenuIcon />
          </div>
        }
        overflow="hidden"
      >
        <Sidebar />
      </Menu>
    </View>
  );
};
