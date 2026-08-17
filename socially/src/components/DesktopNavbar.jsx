import { BellIcon, HomeIcon, UserIcon } from "lucide-react";
import { useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { currentUser } from "@clerk/nextjs/server";
import Link from "next/link";
import { SignInButton, UserButton } from "@clerk/nextjs";
import { ModeToggle } from "./ModeToggle";

async function DesktopNavbar() {
  const user = await currentUser();
  
  return (
    <div className="hidden md:flex items-center space-x-4">
      <ModeToggle/>
      <Button variant="ghost"  className="flex items-center gap-2" asChild>
        <Link href={"/"}>
           <HomeIcon className="w-4 h-4"/>
           <span className="hidden lg:inline">Home</span>
        </Link>
      </Button>
      {
        user ? (
          <>
        <Button variant="ghost"  className="flex items-center gap-2" asChild>
        <Link href="/notification">
           <BellIcon className="w-4 h-4"/>
           <span className="hidden lg:inline">Home</span>
        </Link>
      </Button>
       <Button variant="ghost"  className="flex items-center gap-2" asChild>
        <Link href={`/profile/${user.username ?? user.emailAddresses[0].emailAddress.split("@")[0]}`}>
           <UserIcon className="w-4 h-4"/>
           <span className="hidden lg:inline">Home</span>
        </Link>
      </Button>
      <UserButton/>
      
      </>
        ) : (
            <SignInButton mode="modal">
              <Button variant="default">Sign IN</Button>
            </SignInButton>
        )
      }
    </div>
  );
}
export default DesktopNavbar;