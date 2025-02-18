'use client';

import React, { useCallback, useEffect, useMemo, useState } from "react";
import styles from "./styles/action-menu.module.css";
import { Actions, ActionsProps, Items } from "./types";
import { STARTING_SWEEP, SWEEP_IN_OFFICE_ID } from "./constants";
import { Vector2 } from "three";

const ActionMenu = ({sdk}: ActionsProps) => {
    const [open, setOpen] = useState(false);
    const [items, setItems] = useState<Items>();

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
            sdk.Camera.pose.subscribe(function (pose) {
                // Changes to the Camera pose have occurred.
                console.log('Current position is ', pose.position);
                console.log('Rotation angle is ', pose.rotation);
                console.log('Sweep UUID is ', pose.sweep);
                console.log('View mode is ', pose.mode);
              });
              
            for (const vertex of path) {
                await sdk.Camera.setRotation({
                    x: vertex.data.position.x,
                    y: vertex.data.position.y
                });
                await sdk.Sweep.moveTo(vertex.id, {transition: sdk.Sweep.Transition.FLY});
            }
            sweepGraph.dispose();
        }
    }), [])

    const toggleMenu = useCallback(() => {
        setOpen(!open);
    }, [open]);

    useEffect(() => {
        const fetchData = async () => {
            const response = await fetch("http://localhost:3000");
            if (!response.ok) {
                throw new Error(`Response status: ${response.status}`);
            }
            const result = await response.json() as Items;
            setItems(result);
        };
        fetchData();
    }, []);

    return (
        <div className={styles.menuContainer}>
            <button className={styles.dropdownButton} onClick={toggleMenu}>
                {open ? "X" : "Menu"}
            </button>
            {open && items && (
                <div className={styles.menu}>
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