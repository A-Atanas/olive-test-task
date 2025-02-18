import { MpSdk } from "../../public/sdk";

export type Items = {
    teleport: {
        label: string;
    };
    walk: {
        label: string;
    }
}

export type Actions = {
    [type: string]: (sdk: MpSdk) => void;
}

export type ActionsProps = {
    sdk: MpSdk;
}