import Image from "next/image";
import {Button} from "../components/ui/button"
import { SignedIn , SignedOut , UserButton , SignInButton } from "@clerk/nextjs";
import { ModeToggle } from "@/components/ModeToggle";
import { useTheme } from "next-themes";
export default function Home() {
  const { theme } = useTheme
  return (
    <div className="m-4">
      <SignedOut>
        <SignInButton mode="modal">
          <Button className={"bg-red-500"}>
             SignIn
          </Button>
        </SignInButton>
      </SignedOut>

      <SignedIn>
        <UserButton/>
      </SignedIn>

      <Button variant="secondary" className={`text-black`}>
          Click Me
      </Button>
      <ModeToggle/>
    </div>
  );
}
