'use client';

import React, { useCallback, useEffect, useMemo, useState } from "react";
import styles from "./styles/action-menu.module.css";
import { Actions, ActionsProps, Items } from "./types";
import { STARTING_SWEEP, SWEEP_IN_OFFICE_ID } from "./constants";
import throttle from "lodash/throttle";
import { debounce } from "lodash";

const ActionMenu = ({sdk}: ActionsProps) => {
    const [open, setOpen] = useState(false);
    const [items, setItems] = useState<Items>();
    const [formValue, setFormValue] = useState("");

    const actions: Actions = useMemo(() => ({
        teleport: (sdk) => {
            sdk.Sweep.moveTo(SWEEP_IN_OFFICE_ID, {transition: sdk.Sweep.Transition.INSTANT})
        },
        walk: async (sdk) => {
            const sweepGraph = await sdk.Sweep.createGraph();
            const startSweep = sweepGraph.vertex(STARTING_SWEEP)!;
            const endSweep = sweepGraph.vertex(SWEEP_IN_OFFICE_ID)!;
            for (const { src, dst, weight } of sweepGraph.edges) {
                sweepGraph.setEdge({ src, dst, weight: weight ** 2 });
            }

            const path = sdk.Graph.createAStarRunner(sweepGraph, startSweep, endSweep).exec().path;

            const [pathDots] = await sdk.Scene.createObjects(1);
            for (let i = 0; i < path.length - 1; i++) {
                for (let j = 0; j < 10; j++) {
                    const thisSweep = path[i].data.position;
                    const nextSweep = path[i + 1].data.position;
                    const dotNode = pathDots.addNode();
                    const model = dotNode.addComponent(sdk.Scene.Component.GLTF_LOADER, {
                        url: 'sphere/scene.gltf',
                    });

                    model.inputs!.localScale = {
                        x: 0.002,
                        y: 0.002,
                        z: 0.002
                    };
                    
                    const dx = nextSweep.x - thisSweep.x;
                    const dz = nextSweep.z - thisSweep.z;
                    dotNode.position.set(
                        path[i].data.position.x + dx / 10 * j,
                        thisSweep.y - 1,
                        path[i].data.position.z + dz / 10 * j
                    )
                    dotNode.start();
                }
            }

            for (const vertex of path) {
                // I was never able to rotate a camera towards a point :(
                // const cameraPosition = await sdk.Camera.getPose().then(pose => pose.position);
                // const dx = vertex.data.position.x - cameraPosition.x;
                // const dz = vertex.data.position.z - cameraPosition.z;

                // const yaw = Math.atan2(dz, dx) * (180 / Math.PI);

                await sdk.Sweep.moveTo(vertex.id, {transition: sdk.Sweep.Transition.FLY});
            }
            sweepGraph.dispose();
            for (const dot of pathDots.nodeIterator()) {
                dot.stop();
            }
            pathDots.stop();
        }
    }), [])

    const toggleMenu = useCallback(() => {
        setOpen(!open);
    }, [open]);

    const fetchData = async (search?: string) => {
        const response = await fetch(`http://localhost:3000${search ? "?q=" + search : ""}`);
        if (!response.ok) {
            throw new Error(`Response status: ${response.status}`);
        }
        const result = await response.json() as Items;
        setItems(result);
    };

    const debouncedFetchData = useMemo(() => debounce(fetchData, 500), []);

    useEffect(() => {
        fetchData();
    }, []);

    const handleSearch = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        setFormValue(event.target.value);
        debouncedFetchData(event.target.value);
    }, [debouncedFetchData]);

    return (
        <div className={styles.menuContainer}>
            <button className={styles.dropdownButton} onClick={toggleMenu}>
                {open ? "X" : "Menu"}
            </button>
            {open && items && (
                <div className={styles.menu}>
                    <input type="text" value={formValue} onChange={handleSearch}/>
                    {Object.entries(items).map(([type, {label}]) => (
                        <button key={type} className={styles.menuItem} onClick={() => actions[type](sdk)}>
                            <p>{label}</p>
                        </button>
                    ))}
                </div>
            )}
        </div>
    )
}

export default ActionMenu;