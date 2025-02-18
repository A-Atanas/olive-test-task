'use client';

import { useCallback, useEffect, useState } from "react";
import styles from "./styles/page.module.css";
import { ShowcaseBundleWindow, Tag, MpSdk, Vector3 } from "../../public/sdk";
import ActionMenu from "./action-menu";
import { SWEEP_NEAR_OFFICE_ID, SWEEP_WITH_BANANA_ID } from "./constants";

const tag: Tag.Descriptor = {
  anchorPosition: {
    x: 0,
    y: 0,
    z: 0
  },
  stemVector: {
    x: 0,
    y: 0,
    z: 0
  },
  label: "Office"
}

export default function Home() {
  const [sdk, setSdk] = useState<MpSdk>();
  const [showMenu, setShowMenu] = useState(false);

  const addModel = useCallback(async (sdk: MpSdk, {x, y, z}: Vector3) => {
    const [ sceneObject ] = await sdk!.Scene.createObjects(1);
    const lights = sceneObject.addNode();
    lights.addComponent('mp.directionalLight', {color: {r: 1, g: 1, b: 1}});
    lights.start();

    const modelNode = sceneObject.addNode();
    const model = modelNode.addComponent(sdk!.Scene.Component.GLTF_LOADER, {
      url: 'banana_duck/scene.gltf',
    });
    modelNode.position.set(x, y - 1, z);
    model.inputs!.localScale = {
      x: 0.4,
      y: 0.4,
      z: 0.4
    };

    modelNode.start();

  }, [])

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

      const tagId = await mpSdk!.Tag.add(tag).then(result => result[0]);
      
      mpSdk!.Sweep.data.subscribe({
        onAdded: function (_, item) {
          if (item.id === SWEEP_NEAR_OFFICE_ID) {
            mpSdk!.Tag.editPosition(tagId, {
              anchorPosition: {
                ...item.position,
                z: item.position.z + 5
              }
            });
          }

          if (item.id === SWEEP_WITH_BANANA_ID) {
            addModel(mpSdk, item.position);
          }
        }
      });
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
