import { useRepoStore } from "../../stores/useRepos";
import { Checkbox } from "../controls/Checkbox";
import { Panel } from "../MainPanel";

export function GitIntegrationPanel() {
    const { encryptKeys, toggleEncryption } = useRepoStore();

    return (
        <Panel title="Git Integration">
            <div className="px-4 pt-2">
                <Checkbox label="Secure your keys with a password" value={encryptKeys} onChange={(value) => toggleEncryption(value)} />
                <div className="text-xs text-gray-600 mt-2">
                    This will encrypt your Git credentials with a password, adding an extra layer of security. You will
                    need to enter this password once every time you open MapMaker. All keys are kept locally in your browser.
                </div>
            </div>
        </Panel>
    );
}
