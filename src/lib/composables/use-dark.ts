export interface useDarkProps {
	dark: boolean | null;
}

export default function (
	props: { dark: boolean | null } & Record<string, any>,
	$q: { dark: { isActive: boolean } } & Record<string, any>
) {
	// return isDark
	return props.dark === null ? $q.dark.isActive : props.dark;
}
