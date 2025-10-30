// src/components/TopNavbar.tsx
import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarSeparator,
  MenubarTrigger,
} from "@/components/ui/menubar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Globe } from "lucide-react"

export function TopNavbar() {
  return (
    
    <div 
      className="fixed top-2 left-1/2 -translate-x-1/2 w-[92%] max-w-[2400px] h-12 p-2 z-[1000] 
                    flex items-center justify-between bg-neutral-800/75 backdrop-blur-xs 
                    border border-neutral-100/35 rounded-lg shadow-lg">
      <Menubar className="bg-transparent border-none text-white">
        <MenubarMenu>
          <MenubarTrigger>File</MenubarTrigger>
          <MenubarContent className="z-[1000] bg-neutral-800/75 backdrop-blur-xs border border-neutral-100/35 rounded-lg text-white">
            <MenubarItem>New Mission</MenubarItem>
            <MenubarItem>Open Mission...</MenubarItem>
            {/* <div className="h-px bg-neutral-100/35 mx-4"/> */}
            <MenubarItem>Save</MenubarItem>
            <MenubarItem>Save As...</MenubarItem>
          </MenubarContent>
        </MenubarMenu>
        <MenubarMenu>
          <MenubarTrigger>Edit</MenubarTrigger>
        </MenubarMenu>
        <MenubarMenu>
          <MenubarTrigger>Settings</MenubarTrigger>
        </MenubarMenu>
        <MenubarMenu>
          <MenubarTrigger>Tutorial</MenubarTrigger>
        </MenubarMenu>
        <MenubarMenu>
          <MenubarTrigger>About</MenubarTrigger>
        </MenubarMenu>
        <div className="w-px h-full bg-neutral-100/35 my-2" />
      </Menubar>

      

      <div className="flex items-center gap-4 pr-4">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-white" />
          <Input
            type="search"
            placeholder="Search City"
            className="pl-9 w-48 bg-neutral-100/10 border-none text-white rounded-lg placeholder:text-white "
          />
        </div>
        <span className="text-sm text-white ">12:32</span>
        <Button variant="ghost" size="sm">Log out</Button>
        <Button variant="ghost" size="icon" className="bg-transparent">
          <Globe className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}