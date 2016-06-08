export const defaultConfig = {
    /**
     * Fallout function, handles errors
     */
    fallout: code => {
        throw new Error(`[Router] Fallout code: ${code}`)
    },

    defaultRouteKey: 'home'
};