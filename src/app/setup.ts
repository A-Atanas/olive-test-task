import { MpSdk, Tag, Vector3 } from "../../public/sdk";
import { SWEEP_IN_OFFICE_ID, SWEEP_WITH_BANANA_ID } from "./constants";

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

export const addModel = async (sdk: MpSdk, {x, y, z}: Vector3) => {
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

};

export const setupTagAndModel = async (mpSdk: MpSdk) => {
    const tagId = await mpSdk!.Tag.add(tag).then(result => result[0]);

    mpSdk.Sweep.data.subscribe({
      onAdded: function (_, item) {
        if (item.id === SWEEP_IN_OFFICE_ID) {
          mpSdk!.Tag.editPosition(tagId, {
            anchorPosition: {
              ...item.position,
              z: item.position.z + 1
            }
          });
        }

        if (item.id === SWEEP_WITH_BANANA_ID) {
          addModel(mpSdk, item.position);
        }
      }
    });
  }