'use client';

import React, { useCallback, useEffect, useMemo, useState } from "react";
import styles from "./styles/action-menu.module.css";
import { Actions, ActionsProps, Items } from "./types";
import { SWEEP_NEAR_OFFICE_ID } from "./constants";

const ActionMenu = ({sdk}: ActionsProps) => {
    const [open, setOpen] = useState(false);
    const [items, setItems] = useState<Items>();

    const actions: Actions = useMemo(() => ({
        teleport: (sdk) => {sdk.Sweep.moveTo(SWEEP_NEAR_OFFICE_ID, {})},
        walk: (sdk) => {}
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