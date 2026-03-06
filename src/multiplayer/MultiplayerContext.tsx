import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import Peer, { DataConnection } from "peerjs";
import { MPMsg } from "./types";

type MPRole = "host" | "guest" | null;

interface MPCtx {
  role: MPRole;
  roomCode: string | null;
  connected: boolean;
  waitingForOpponent: boolean;
  guestTeamId: string | null;
  mpError: string | null;
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
  waitingForOpponent: false, guestTeamId: null, mpError: null,
  createRoom: () => {}, joinRoom: () => {}, sendMessage: () => {},
  setWaiting: () => {}, onMessage: () => () => {}, disconnect: () => {},
});

export function MultiplayerProvider({ children }: { children: React.ReactNode }) {
  const [role, setRole]       = useState<MPRole>(null);
  const [roomCode, setCode]   = useState<string | null>(null);
  const [connected, setConn]  = useState(false);
  const [waiting, setWaiting] = useState(false);
  const [guestTeamId, setGuestTeamId] = useState<string | null>(null);
  const [mpError, setMpError] = useState<string | null>(null);

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
    // The "open" event may already have fired by the time we attach the listener
    // (especially on the host side). Check conn.open synchronously first.
    if (conn.open) {
      setConn(true);
    } else {
      conn.on("open", () => setConn(true));
    }
  }, [dispatch]);

  const ICE_CONFIG = {
    iceServers: [
      { urls: "stun:stun.l.google.com:19302" },
      { urls: "stun:stun1.l.google.com:19302" },
      { urls: "stun:stun.cloudflare.com:3478" },
    ],
  };

  const createRoom = useCallback(() => {
    // Generate a short 6-char alphanumeric code as the peer ID (lowercase for PeerJS)
    const code = Math.random().toString(36).substring(2, 8).toLowerCase();
    const peer = new Peer(code, { config: ICE_CONFIG });
    peerRef.current = peer;
    setRole("host");
    setCode(code.toUpperCase());

    peer.on("connection", (conn) => {
      wireConn(conn);
    });
    peer.on("error", (e) => {
      console.error("[MP host]", e);
      setMpError("Connection failed. Check your internet and try again.");
    });
  }, [wireConn]);

  const joinRoom = useCallback((code: string) => {
    const peer = new Peer(undefined as unknown as string, { config: ICE_CONFIG });
    peerRef.current = peer;
    setRole("guest");
    setCode(code.toUpperCase());
    setMpError(null);

    peer.on("open", () => {
      const conn = peer.connect(code.toLowerCase());
      wireConn(conn);
    });
    peer.on("error", (e) => {
      console.error("[MP guest]", e);
      setMpError("Could not connect. Make sure the room code is correct.");
    });
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
    setMpError(null);
  }, []);

  // Cleanup on unmount
  useEffect(() => () => { peerRef.current?.destroy(); }, []);

  return (
    <Ctx.Provider value={{
      role, roomCode, connected, waitingForOpponent: waiting, guestTeamId, mpError,
      createRoom, joinRoom, sendMessage, setWaiting, onMessage, disconnect,
    }}>
      {children}
    </Ctx.Provider>
  );
}

export function useMultiplayer() {
  return useContext(Ctx);
}
