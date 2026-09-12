import React from 'react';
import {
	CodeIcon,
	Grid2x2PlusIcon,
	GlobeIcon,
	LayersIcon,
	UserPlusIcon,
	Users,
	Star,
	FileText,
	Shield,
	RotateCcw,
	Handshake,
	Leaf,
	HelpCircle,
	DollarSign,
	BarChart,
	PlugIcon,
	MenuIcon,
	XIcon,
} from 'lucide-react';
import {
	Sheet,
	SheetClose,
	SheetContent,
	SheetTrigger,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import {
	NavigationMenu,
	NavigationMenuContent,
	NavigationMenuList,
	NavigationMenuItem,
	NavigationMenuTrigger,
	NavigationMenuLink,
	type NavItemType,
	NavGridCard,
	NavSmallItem,
	NavLargeItem,
	NavItemMobile,
} from '@/components/ui/navigation-menu';
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from '@/components/ui/accordion';
import { cn } from '@/lib/utils';

export const productLinks: NavItemType[] = [
	{
		title: 'AI Path Generator',
		href: '#path-generator',
		description: 'Synthesize personalized learning roadmaps',
		icon: GlobeIcon,
	},
	{
		title: 'Skill Gap Engine',
		href: '#skill-gap',
		description: 'Analyze competency gaps against target roles',
		icon: LayersIcon,
	},
	{
		title: 'Team Analytics',
		href: '#team-analytics',
		description: 'Track team skill development metrics',
		icon: UserPlusIcon,
	},
	{
		title: 'Progress Dashboard',
		href: '#dashboard',
		icon: BarChart,
	},
	{
		title: 'LMS Integrations',
		href: '#integrations',
		icon: PlugIcon,
	},
	{
		title: 'Enterprise Tier',
		href: '#enterprise',
		icon: DollarSign,
	},
	{
		title: 'Data Privacy & Ethics',
		href: '#privacy',
		icon: Shield,
	},
	{
		title: 'Pathcraft API',
		href: '#api',
		icon: CodeIcon,
	},
];

export const companyLinks: NavItemType[] = [
	{
		title: 'About Pathcraft',
		href: '#about',
		description: 'Learn about our adaptive learning mission',
		icon: Users,
	},
	{
		title: 'Learner Stories',
		href: '#stories',
		description: 'Read career transition success stories',
		icon: Star,
	},
	{
		title: 'Terms of Service',
		href: '#terms',
		description: 'Understand how we operate',
		icon: FileText,
	},
	{
		title: 'Privacy Policy',
		href: '#privacy-policy',
		description: 'How we protect your data',
		icon: Shield,
	},
	{
		title: 'Refund Policy',
		href: '#refund',
		description: 'Details about subscriptions',
		icon: RotateCcw,
	},
	{
		title: 'University Partners',
		href: '#partners',
		icon: Handshake,
		description: 'Collaborate for accredited paths',
	},
	{
		title: 'AI Blog',
		href: '#blog',
		icon: Leaf,
		description: 'Latest research in personalized learning',
	},
	{
		title: 'Help Center',
		href: '#help',
		icon: HelpCircle,
		description: 'Find answers to your questions',
	},
];

export default function NavigationMenuDemo() {
	return (
		<div className="relative w-full px-4 my-4 z-40">
			<div
				aria-hidden="true"
				className={cn(
					'absolute inset-0 -z-10 size-full',
					'bg-[radial-gradient(color-mix(in_oklab,var(--color-slate-400)_30%,transparent)_2px,transparent_2px)]',
					'bg-[size:12px_12px]',
				)}
			/>

			<div className="bg-white/90 backdrop-blur-md sticky top-4 z-50 mx-auto h-14 w-full max-w-5xl border border-slate-200 px-4 rounded-2xl shadow-sm">
				<div className="flex h-full items-center justify-between">
					<div className="flex items-center gap-2">
						<Grid2x2PlusIcon className="size-6 text-sky-600" />
						<p className="font-extrabold text-base text-slate-900">Pathcraft <span className="text-sky-600 font-normal">AI</span></p>
					</div>
					<DesktopMenu />

					<div className="flex items-center gap-2">
						<Button className="bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs rounded-xl shadow-md">Get Started</Button>
						<MoileNav />
					</div>
				</div>
			</div>
		</div>
	);
}

function DesktopMenu() {
	return (
		<NavigationMenu className="hidden lg:block">
			<NavigationMenuList>
				<NavigationMenuItem>
					<NavigationMenuTrigger>Product</NavigationMenuTrigger>
					<NavigationMenuContent>
						<div className="grid w-full md:w-4xl md:grid-cols-[1fr_.30fr] bg-white border border-slate-200 rounded-2xl shadow-xl">
							<ul className="grid grow gap-4 p-4 md:grid-cols-3 md:border-r border-slate-100">
								{productLinks.slice(0, 3).map((link) => (
									<li key={link.title}>
										<NavGridCard link={link} />
									</li>
								))}
							</ul>
							<ul className="space-y-1 p-4">
								{productLinks.slice(3).map((link) => (
									<li key={link.title}>
										<NavSmallItem
											item={link}
											href={link.href}
											className="gap-x-1"
										/>
									</li>
								))}
							</ul>
						</div>
					</NavigationMenuContent>
				</NavigationMenuItem>

				<NavigationMenuItem>
					<NavigationMenuTrigger>Company</NavigationMenuTrigger>
					<NavigationMenuContent>
						<div className="grid w-full md:w-4xl md:grid-cols-[1fr_.40fr] bg-white border border-slate-200 rounded-2xl shadow-xl">
							<ul className="grid grow grid-cols-2 gap-4 p-4 md:border-r border-slate-100">
								{companyLinks.slice(0, 2).map((link) => (
									<li key={link.title}>
										<NavGridCard link={link} className="min-h-36" />
									</li>
								))}
								<div className="col-span-2 grid grid-cols-3 gap-x-4">
									{companyLinks.slice(2, 5).map((link) => (
										<li key={link.title}>
											<NavLargeItem href={link.href} link={link} />
										</li>
									))}
								</div>
							</ul>
							<ul className="space-y-2 p-4">
								{companyLinks.slice(5, 8).map((link) => (
									<li key={link.title}>
										<NavLargeItem href={link.href} link={link} />
									</li>
								))}
							</ul>
						</div>
					</NavigationMenuContent>
				</NavigationMenuItem>

				<NavigationMenuItem>
					<NavigationMenuLink className="cursor-pointer font-bold text-xs text-slate-700 px-3 py-2 hover:text-sky-600 transition-colors">
						Pricing
					</NavigationMenuLink>
				</NavigationMenuItem>
			</NavigationMenuList>
		</NavigationMenu>
	);
}

function MoileNav() {
	const sections = [
		{
			id: 'product',
			name: 'Product',
			list: productLinks,
		},
		{
			id: 'company',
			name: 'Company',
			list: companyLinks,
		},
	];

	return (
		<Sheet>
			<SheetTrigger asChild>
				<Button size="icon" variant="ghost" className="rounded-full lg:hidden">
					<MenuIcon className="size-5" />
				</Button>
			</SheetTrigger>
			<SheetContent
				className="bg-white/95 w-full gap-0 backdrop-blur-lg border-l border-slate-200"
				showClose={false}
			>
				<div className="flex h-14 items-center justify-end border-b border-slate-100 px-4">
					<SheetClose asChild>
						<Button size="icon" variant="ghost" className="rounded-full">
							<XIcon className="size-5" />
							<span className="sr-only">Close</span>
						</Button>
					</SheetClose>
				</div>
				<div className="container grid gap-y-2 overflow-y-auto px-4 pt-5 pb-12">
					<Accordion type="single" collapsible>
						{sections.map((section) => (
							<AccordionItem key={section.id} value={section.id}>
								<AccordionTrigger className="capitalize hover:no-underline font-extrabold text-sm text-slate-900">
									{section.id}
								</AccordionTrigger>
								<AccordionContent className="space-y-1">
									<ul className="grid gap-1">
										{section.list.map((link) => (
											<li key={link.title}>
												<SheetClose asChild>
													<NavItemMobile item={link} href={link.href} />
												</SheetClose>
											</li>
										))}
									</ul>
								</AccordionContent>
							</AccordionItem>
						))}
					</Accordion>
				</div>
			</SheetContent>
		</Sheet>
	);
}
