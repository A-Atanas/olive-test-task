'use client';

import React, { useCallback, useEffect, useState } from "react";
import styles from "./styles/action-menu.module.css"; 

type Items = {
    teleport: {
        label: string;
    };
    walk: {
        label: string;
    }
}

const ActionMenu = () => {
    const [open, setOpen] = useState(false);
    const [items, setItems] = useState<Items>();

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
                        <p key={type} className={styles.menuItem}>{label}</p>
                    ))}
                </div>
            )}
        </div>
    )
}

export default ActionMenu;