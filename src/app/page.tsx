'use client';

import { useEffect, useState } from "react";
import styles from "./styles/page.module.css";
import { ShowcaseBundleWindow, MpSdk } from "../../public/sdk";
import ActionMenu from "./action-menu";
import { setupTagAndModel } from "./setup";

export default function Home() {
  const [sdk, setSdk] = useState<MpSdk>();
  const [showMenu, setShowMenu] = useState(false);

  useEffect(() => {
    const showcase = document.getElementById('showcase') as HTMLIFrameElement;
    const showcaseWindow = showcase.contentWindow as ShowcaseBundleWindow;
    showcase.addEventListener('load', async function() {
      let mpSdk;
      try {
        mpSdk = await showcaseWindow.MP_SDK.connect(showcaseWindow);
        setSdk(mpSdk);
      }
      catch(e) {
        console.error(e);
        return;
      }

      await setupTagAndModel(mpSdk);
      await mpSdk.App.state.waitUntil(state => state.phase === mpSdk.App.Phase.PLAYING);
      setShowMenu(true);
    });
  }, []);

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <iframe
          id="showcase"
          width="1110"
          height="720"
          src="showcase.html?m=m72PGKzeknR&applicationKey=295ba0c0f04541318359a8e75af33043"
          frameBorder="0"
          allowFullScreen
          allow="vr"
        />
        {showMenu && <ActionMenu sdk={sdk!}/>}
      </main>
    </div>
  );
}
