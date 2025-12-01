"use client"

import { useEffect, useState } from "react";
import { boardDataService, boardService } from "../services"
import { useUser } from "@clerk/nextjs"
import { Board } from "../supabase/models";
import { useSupabase } from "../supabase/SupabaseProvider";

export function useBoards() {
    const {user} = useUser();
    const { supabase } = useSupabase();
    const [boards, setBoards] = useState<Board[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        if (user) {
            loadBoards();
        }
    }, [user, supabase]);

    async function loadBoards() {
        if (!user) return;

        try {
            setLoading(true);
            setError(null);
            const data = await boardService.getBoards(supabase!, user.id);
            setBoards(data);
        } catch (error) {
            setError(error instanceof Error ? error.message : "Failed to Load Board");
        } finally {
            setLoading(false);
        }
    }
   
    async function createBoard(boardData: {
        title: string,
        description?: string,
        color?: string
    }) {

        if (!user) throw new Error("User not authenticated")

        try {
            const newBoard = await boardDataService.createBoardWithDefaultColumns(
                supabase!,
                {
                ...boardData,
                userId: user?.id
            });
            setBoards((prev) => [newBoard, ...prev]);
        } catch (error) {
            setError(error instanceof Error ? error.message : "Failed to Create Board")
        }
    }
    
    return { boards, loading, error, createBoard };

}