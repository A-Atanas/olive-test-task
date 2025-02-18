'use client';

import { useCallback, useEffect } from "react";
import styles from "./page.module.css";
import { ShowcaseBundleWindow, Tag, MpSdk, Vector3 } from "../../public/sdk";

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

const SWEEP_WITH_BANANA_ID = "665pcnn0eaxz2x80xb473gg3b";
const SWEEP_NEAR_OFFICE_ID = "w37dug1fg2az31k06590r8eaa";

export default function Home() {

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
