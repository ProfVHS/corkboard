import { create } from "zustand";
import type { ReleaseType } from "@/types/ReleaseType.ts";

interface ReleasesStore {
    releases: ReleaseType[];
    setReleases: (releases: ReleaseType[]) => void;
    reset: () => void;
}

const useReleasesStore = create<ReleasesStore>((set) => ({
    releases: [],
    setReleases: (releases) => set({ releases }),
    reset: () => set({ releases: [] }),
}));

export default useReleasesStore;
