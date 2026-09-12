import * as React from "react"
import * as NavigationMenuPrimitive from "@radix-ui/react-navigation-menu"
import { cva } from "class-variance-authority"
import { ChevronDown, LucideIcon } from "lucide-react"

import { cn } from "@/lib/utils"

export type NavItemType = {
  title: string
  href: string
  description?: string
  icon?: LucideIcon
}

const NavigationMenu = React.forwardRef<
  React.ElementRef<typeof NavigationMenuPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof NavigationMenuPrimitive.Root>
>(({ className, children, ...props }, ref) => (
  <NavigationMenuPrimitive.Root
    ref={ref}
    className={cn(
      "relative z-10 flex max-w-max flex-1 items-center justify-center",
      className
    )}
    {...props}
  >
    {children}
    <NavigationMenuViewport />
  </NavigationMenuPrimitive.Root>
))
NavigationMenu.displayName = NavigationMenuPrimitive.Root.displayName

const NavigationMenuList = React.forwardRef<
  React.ElementRef<typeof NavigationMenuPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof NavigationMenuPrimitive.List>
>(({ className, ...props }, ref) => (
  <NavigationMenuPrimitive.List
    ref={ref}
    className={cn(
      "group flex flex-1 list-none items-center justify-center space-x-1",
      className
    )}
    {...props}
  />
))
NavigationMenuList.displayName = NavigationMenuPrimitive.List.displayName

const NavigationMenuItem = NavigationMenuPrimitive.Item

const navigationMenuTriggerStyle = cva(
  "group inline-flex h-10 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-accent/50 data-[state=open]:bg-accent/50"
)

const NavigationMenuTrigger = React.forwardRef<
  React.ElementRef<typeof NavigationMenuPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof NavigationMenuPrimitive.Trigger>
>(({ className, children, ...props }, ref) => (
  <NavigationMenuPrimitive.Trigger
    ref={ref}
    className={cn(navigationMenuTriggerStyle(), "group", className)}
    {...props}
  >
    {children}{" "}
    <ChevronDown
      className="relative top-[1px] ml-1 h-3 w-3 transition duration-200 group-data-[state=open]:rotate-180"
      aria-hidden="true"
    />
  </NavigationMenuPrimitive.Trigger>
))
NavigationMenuTrigger.displayName = NavigationMenuPrimitive.Trigger.displayName

const NavigationMenuContent = React.forwardRef<
  React.ElementRef<typeof NavigationMenuPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof NavigationMenuPrimitive.Content>
>(({ className, ...props }, ref) => (
  <NavigationMenuPrimitive.Content
    ref={ref}
    className={cn(
      "left-0 top-0 w-full data-[motion^=from-]:animate-in data-[motion^=to-]:animate-out data-[motion^=from-]:fade-in data-[motion^=to-]:fade-out data-[motion=from-end]:slide-in-from-right-52 data-[motion=from-start]:slide-in-from-left-52 data-[motion=to-end]:slide-out-to-right-52 data-[motion=to-start]:slide-out-to-left-52 md:absolute md:w-auto",
      className
    )}
    {...props}
  />
))
NavigationMenuContent.displayName = NavigationMenuPrimitive.Content.displayName

const NavigationMenuLink = NavigationMenuPrimitive.Link

const NavigationMenuViewport = React.forwardRef<
  React.ElementRef<typeof NavigationMenuPrimitive.Viewport>,
  React.ComponentPropsWithoutRef<typeof NavigationMenuPrimitive.Viewport>
>(({ className, ...props }, ref) => (
  <div className={cn("absolute left-0 top-full flex justify-center")}>
    <NavigationMenuPrimitive.Viewport
      className={cn(
        "origin-top-center relative mt-1.5 h-[var(--radix-navigation-menu-viewport-height)] w-full overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-lg data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-90 md:w-[var(--radix-navigation-menu-viewport-width)]",
        className
      )}
      ref={ref}
      {...props}
    />
  </div>
))
NavigationMenuViewport.displayName =
  NavigationMenuPrimitive.Viewport.displayName

export function NavGridCard({ link, className }: { link: NavItemType; className?: string }) {
  const Icon = link.icon
  return (
    <a
      href={link.href}
      className={cn(
        "flex flex-col justify-between rounded-lg p-3 hover:bg-accent hover:text-accent-foreground transition-all border border-transparent hover:border-border",
        className
      )}
    >
      <div>
        {Icon && <Icon className="size-5 mb-2 text-primary" />}
        <div className="font-semibold text-sm">{link.title}</div>
        {link.description && (
          <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
            {link.description}
          </p>
        )}
      </div>
    </a>
  )
}

export function NavSmallItem({ item, href, className }: { item: NavItemType; href: string; className?: string }) {
  const Icon = item.icon
  return (
    <a
      href={href}
      className={cn(
        "flex items-center gap-2 rounded-md p-2 text-sm hover:bg-accent transition-colors",
        className
      )}
    >
      {Icon && <Icon className="size-4 text-muted-foreground shrink-0" />}
      <span className="font-medium text-xs">{item.title}</span>
    </a>
  )
}

export function NavLargeItem({ link, href, className }: { link: NavItemType; href: string; className?: string }) {
  const Icon = link.icon
  return (
    <a
      href={href}
      className={cn(
        "flex items-start gap-3 rounded-lg p-2 hover:bg-accent transition-all",
        className
      )}
    >
      {Icon && <Icon className="size-4 mt-0.5 text-primary shrink-0" />}
      <div>
        <div className="text-xs font-semibold">{link.title}</div>
        {link.description && (
          <p className="text-[11px] text-muted-foreground line-clamp-1">
            {link.description}
          </p>
        )}
      </div>
    </a>
  )
}

export function NavItemMobile({ item, href }: { item: NavItemType; href: string }) {
  const Icon = item.icon
  return (
    <a
      href={href}
      className="flex items-center gap-3 rounded-lg p-2.5 hover:bg-accent text-sm font-medium transition-colors"
    >
      {Icon && <Icon className="size-4 text-sky-600 shrink-0" />}
      <div>
        <div className="text-xs font-bold text-slate-800">{item.title}</div>
        {item.description && (
          <p className="text-[11px] text-slate-500 font-normal">{item.description}</p>
        )}
      </div>
    </a>
  )
}

export {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuContent,
  NavigationMenuTrigger,
  NavigationMenuLink,
  NavigationMenuViewport,
}
