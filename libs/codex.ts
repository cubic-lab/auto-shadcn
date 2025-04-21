import { parse, print, visit, types } from 'recast';
import tsParser from 'recast/parsers/babel-ts.js';

const SHADCN_RULES = [
	{
		matcher: '^Avatar.*',
		source: '@/components/ui/avatar',
	},
	{
		matcher: '^AspectRatio',
		source: '@/components/ui/aspect-ratio',
	},
	{
		matcher: '^Badge',
		source: '@/components/ui/badge',
	},
	{
		matcher: '^Button',
		source: '@/components/ui/button',
	},
	{
		matcher: '^Card.*',
		source: '@/components/ui/card',
	},
	{
		matcher: '^Checkbox',
		source: '@/components/ui/checkbox',
	},
	{
		matcher: '^Collapsible.*',
		source: '@/components/ui/collapsible',
	},
	{
		matcher: '^Menubar.*',
		source: '@/components/ui/menubar',
	},
	{
		matcher: '^Select.*',
		source: '@/components/ui/select',
	},
	{
		matcher: '^RadioGroup.*',
		source: '@/components/ui/radio-group',
	},
	{
		matcher: '^Textarea',
		source: '@/components/ui/textarea',
	},
	{
		matcher: '^ToggleGroup.*',
		source: '@/components/ui/toggle-group',
	},
	{
		matcher: '^Toggle',
		source: '@/components/ui/toggle',
	},
	{
		matcher: '^Skeleton',
		source: '@/components/ui/skeleton',
	},
	{
		matcher: '^Slider',
		source: '@/components/ui/slider',
	},
	{
		matcher: '^Tooltip.*',
		source: '@/components/ui/tooltip',
	},
	{
		matcher: '^Label',
		source: '@/components/ui/label',
	},
	{
		matcher: '^Input',
		source: '@/components/ui/input',
	},
	{
		matcher: '^ScrollArea',
		source: '@/components/ui/scroll-area',
	},
	{
		matcher: '^Switch',
		source: '@/components/ui/switch',
	},
	{
		matcher: '^Dialog.*',
		source: '@/components/ui/dialog',
	},
	{
		matcher: '^Sheet.*',
		source: '@/components/ui/sheet',
	},
	{
		matcher: '^Separator',
		source: '@/components/ui/separator',
	},
	{
		matcher: '^NavigationMenu.*',
		source: '@/components/ui/navigation-menu',
	},
	{
		matcher: '^HoverCard.*',
		source: '@/components/ui/hover-card',
	},
	{
		matcher: '^DropdownMenu.*',
		source: '@/components/ui/dropdown-menu',
	},
	{
		matcher: '^Accordion.*',
		source: '@/components/ui/accordion',
	},
	{
		matcher: '^AlertDialog.*',
		source: '@/components/ui/alert-dialog',
	},
	{
		matcher: '^Alert.*',
		source: '@/components/ui/alert',
	},
	{
		matcher: '^Table.*',
		source: '@/components/ui/table',
	},
	{
		matcher: '^Tabs.*',
		source: '@/components/ui/tabs',
	},
	{
		matcher: '^Popover.*',
		source: '@/components/ui/popover',
	},
	{
		matcher: '^Calendar',
		source: '@/components/ui/calendar',
	},
	{
		matcher: '^Command.*',
		source: '@/components/ui/command',
	},
	{
		matcher: '^ContextMenu.*',
		source: '@/components/ui/context-menu',
	},
	{
		matcher: '^Carousel.*',
		source: '@/components/ui/carousel',
	},
	{
		matcher: '^Drawer.*',
		source: '@/components/ui/drawer',
	},
	{
		matcher: '^Pagination.*',
		source: '@/components/ui/pagination',
	},
	{
		matcher: '^Resizable.*',
		source: '@/components/ui/resizable',
	},
	{
		matcher: '^ResponsiveBar',
		source: '@nivo/bar',
	},
	{
		matcher: '^ResponsiveLine',
		source: '@nivo/line',
	},
	{
		matcher: '^ResponsivePie',
		source: '@nivo/pie',
	},
	{
		matcher: '^ResponsiveScatterPlot',
		source: '@nivo/scatterplot',
	},
	{
		matcher: '^ResponsiveHeatMap',
		source: '@nivo/heatmap',
	},
];

const LUCIDE_ICONS: Record<string, unknown> = {};

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
const iconNodes: any = await fetch('https://lucide.dev/api/icon-nodes').then(
	(res) => res.json(),
);

for (const key in iconNodes) {
	const newKey = key
		.split('-')
		.map((part) => part.charAt(0).toUpperCase() + part.slice(1))
		.join('');
	LUCIDE_ICONS[newKey] = iconNodes[key];
}

function mapImports(used: string[], declarations: Set<string>) {
	const importMap: Record<string, Set<string>> = {};
	const fallbacks: string[] = [];

	for (const u of used) {
		let source = '';
		let fallback = false;

		for (const rule of SHADCN_RULES) {
			if (new RegExp(rule.matcher).test(u)) {
				source = rule.source;
				break;
			}
		}

		if (!source && LUCIDE_ICONS[u]) {
			source = 'lucide-react';
		}

		if (!source && declarations.has(u)) {
			continue;
		}

		if (!source) {
			// fallback to Home icon
			source = 'lucide-react';
			fallback = true;
			fallbacks.push(u);
		}

		if (!importMap[source]) {
			importMap[source] = new Set();
		}
		importMap[source]?.add(fallback ? 'Home' : u);
	}

	let importStr = '';
	for (const key in importMap) {
		const statement = `import { ${Array.from(importMap[key] || []).join(
			', ',
		)} } from '${key}';`;
		importStr += `${statement}\r\n`;
	}

	return { importStr, fallbacks };
}

export function refineCode(code?: string) {
	if (!code) {
		throw new Error('code cannot be null');
	}
	const fromReact = new Set<string>();
	const usedVariables = new Set<string>();
	const declarations = new Set<string>();

	const ast = parse(code, {
		parser: tsParser,
	});

	visit(ast, {
		visitImportDeclaration(p) {
			const isReact =
				p.node.source.type === 'StringLiteral' &&
				p.node.source.value === 'react';

			if (!isReact) {
				p.replace();
			} else {
				for (const s of p.node.specifiers || []) {
					fromReact.add(s.local?.name.toString() || '');
				}
			}

			this.traverse(p);
		},
	});

	visit(ast, {
		visitIdentifier(p) {
			const varName = p.node.name;
			const isDecl = ['VariableDeclarator', 'FunctionDeclaration'].includes(
				p.parent?.node.type,
			);

			if (isDecl) {
				declarations.add(varName);
			}

			// TODO: collect with a better strategy
			// if (!fromReact.has(varName) && !isDecl) {
			//   usedVariables.add(varName);
			// }
			this.traverse(p);
		},
		visitJSXIdentifier(p) {
			const elName = p.node.name;
			if (
				p.parent?.node.type === 'JSXOpeningElement' &&
				elName.at(0)?.toUpperCase() === elName[0] &&
				!fromReact.has(elName)
			) {
				usedVariables.add(elName);
			}
			this.traverse(p);
		},
	});

	const { importStr, fallbacks } = mapImports(
		Array.from(usedVariables),
		declarations,
	);

	visit(ast, {
		visitJSXIdentifier(p) {
			const elName = p.node.name;
			if (
				['JSXOpeningElement', 'JSXClosingElement'].includes(
					p.parent?.node.type,
				) &&
				elName.at(0)?.toUpperCase() === elName[0] &&
				!fromReact.has(elName) &&
				fallbacks.includes(elName)
			) {
				p.replace(types.builders.jsxIdentifier('div'));
			}
			this.traverse(p);
		},
	});

	return importStr + print(ast).code;
}
