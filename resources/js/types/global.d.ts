// Global route helper function declaration from Ziggy
declare global {
    interface Window {
        route: {
            (name: string, params?: any, absolute?: boolean): string;
            current(): string;
            current(name: string): boolean;
        }
    }

    function route(name: string, params?: any, absolute?: boolean): string;
}

export {};
