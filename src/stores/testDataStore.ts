import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

interface TestDataState {
    useTestData: boolean
    toggleTestData: () => void
    setUseTestData: (value: boolean) => void
}

export const useTestDataStore = create<TestDataState>()(
    persist(
        (set) => ({
            useTestData: true, // Default to true for development

            toggleTestData: () =>
                set((state) => ({ useTestData: !state.useTestData })),

            setUseTestData: (value: boolean) =>
                set({ useTestData: value })
        }),
        {
            name: 'farm-wise-test-data', // unique name for localStorage
            storage: createJSONStorage(() => localStorage),
            partialize: (state) => ({ useTestData: state.useTestData }),
        }
    )
) 