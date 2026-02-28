import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import Peer, { DataConnection } from "peerjs";
import { MPMsg } from "./types";

type MPRole = "host" | "guest" | null;

interface MPCtx {
  role: MPRole;
  roomCode: string | null;
  connected: boolean;
  waitingForOpponent: boolean;
  guestTeamId: string | null;        // set once guest sends their team choice
  // Actions
  createRoom: () => void;
  joinRoom: (code: string) => void;
  sendMessage: (msg: MPMsg) => void;
  setWaiting: (v: boolean) => void;
  onMessage: (handler: (msg: MPMsg) => void) => () => void;
  disconnect: () => void;
}

const Ctx = createContext<MPCtx>({
  role: null, roomCode: null, connected: false,
  waitingForOpponent: false, guestTeamId: null,
  createRoom: () => {}, joinRoom: () => {}, sendMessage: () => {},
  setWaiting: () => {}, onMessage: () => () => {}, disconnect: () => {},
});

export function MultiplayerProvider({ children }: { children: React.ReactNode }) {
  const [role, setRole]       = useState<MPRole>(null);
  const [roomCode, setCode]   = useState<string | null>(null);
  const [connected, setConn]  = useState(false);
  const [waiting, setWaiting] = useState(false);
  const [guestTeamId, setGuestTeamId] = useState<string | null>(null);

  const peerRef = useRef<Peer | null>(null);
  const connRef = useRef<DataConnection | null>(null);
  const handlers = useRef<Set<(msg: MPMsg) => void>>(new Set());

  /** Deliver a raw data message to all registered handlers */
  const dispatch = useCallback((raw: unknown) => {
    const msg = raw as MPMsg;
    handlers.current.forEach((h) => h(msg));
  }, []);

  /** Wire up incoming data events on a connection */
  const wireConn = useCallback((conn: DataConnection) => {
    connRef.current = conn;
    conn.on("data",  dispatch);
    conn.on("close", () => { setConn(false); connRef.current = null; });
    conn.on("open",  () => setConn(true));
  }, [dispatch]);

  const createRoom = useCallback(() => {
    // Generate a short 6-char alphanumeric code as the peer ID
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    const peer = new Peer(code);
    peerRef.current = peer;
    setRole("host");
    setCode(code);

    peer.on("connection", (conn) => {
      wireConn(conn);
    });
    peer.on("error", (e) => console.error("[MP host]", e));
  }, [wireConn]);

  const joinRoom = useCallback((code: string) => {
    const peer = new Peer();
    peerRef.current = peer;
    setRole("guest");
    setCode(code.toUpperCase());

    peer.on("open", () => {
      const conn = peer.connect(code.toUpperCase());
      wireConn(conn);
    });
    peer.on("error", (e) => console.error("[MP guest]", e));
  }, [wireConn]);

  const sendMessage = useCallback((msg: MPMsg) => {
    connRef.current?.send(msg);
  }, []);

  const onMessage = useCallback((handler: (msg: MPMsg) => void) => {
    handlers.current.add(handler);
    return () => { handlers.current.delete(handler); };
  }, []);

  const disconnect = useCallback(() => {
    connRef.current?.close();
    peerRef.current?.destroy();
    connRef.current = null;
    peerRef.current = null;
    setRole(null);
    setCode(null);
    setConn(false);
    setWaiting(false);
    setGuestTeamId(null);
  }, []);

  // Cleanup on unmount
  useEffect(() => () => { peerRef.current?.destroy(); }, []);

  return (
    <Ctx.Provider value={{
      role, roomCode, connected, waitingForOpponent: waiting, guestTeamId,
      createRoom, joinRoom, sendMessage, setWaiting, onMessage, disconnect,
    }}>
      {children}
    </Ctx.Provider>
  );
}

export function useMultiplayer() {
  return useContext(Ctx);
}
