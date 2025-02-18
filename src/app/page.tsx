'use client';

import { useEffect } from "react";
import styles from "./page.module.css";
import { ShowcaseBundleWindow, Tag } from "../../public/sdk";

const tag: Tag.Descriptor = {
  anchorPosition: {
    x: 51,
    y: 1,
    z: -3
  },
  stemVector: {
    x: 0,
    y: 0,
    z: 0
  },
  label: "Office"
}

export default function Home() {

  useEffect(() => {
    const showcase = document.getElementById('showcase') as HTMLIFrameElement;
    const showcaseWindow = showcase.contentWindow as ShowcaseBundleWindow;
    showcase.addEventListener('load', async function() {
      let mpSdk;
      try {
        mpSdk = await showcaseWindow.MP_SDK.connect(showcaseWindow);
      }
      catch(e) {
        console.error(e);
        return;
      }

      mpSdk.Tag.add(tag)
    });
  }, []);

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <iframe
          id="showcase"
          width="740"
          height="480"
          src="showcase.html?m=m72PGKzeknR&applicationKey=295ba0c0f04541318359a8e75af33043"
          frameBorder="0"
          allowFullScreen
          allow="vr"
        />
      </main>
    </div>
  );
}
