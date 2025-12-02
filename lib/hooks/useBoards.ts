"use client"

import { useEffect, useState } from "react";
import { boardDataService, boardService } from "../services"
import { useUser } from "@clerk/nextjs"
import { Board, Column } from "../supabase/models";
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

export function useBoard(boardId: string) {
    const {supabase} = useSupabase();
    const [board, setBoard] = useState<Board | null>(null);
    const [columns, setColumns] = useState<Column[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (boardId) {
            loadBoard();
        }
    }, [boardId, supabase]);

    async function loadBoard() {
        if (!boardId) return;

        try {
            setLoading(true);
            setError(null);
            const data = await boardDataService.createBoardWithColumns(supabase!, boardId);
            setBoard(data.board);
            setColumns(data.columns);
        } catch (error) {
            setError(error instanceof Error ? error.message : "Failed to Load Board");
        } finally {
            setLoading(false);
        }
    }

async function updateBoard(boardId: string, updates: Partial<Board>) {
        try {
            const updatedBoard = await boardService.updateBoard(supabase!, boardId, updates);
            setBoard(updatedBoard)
            return updatedBoard;
        } catch (error) {
            setError(error instanceof Error ? error.message : "Failed ton Update the Board");
        }
    }

    return {
        board, 
        columns,
        loading, 
        error,
        updateBoard,
    }
}