/* tslint:disable */
/* eslint-disable */

export class OmemoCrypto {
    free(): void;
    [Symbol.dispose](): void;
    /**
     * Returns the local OMEMO bundle as a plain JS object.
     */
    bundle(): any;
    /**
     * Decrypt a key slot.  `is_prekey` is the hint from the incoming OMEMO header.
     */
    decrypt_key(jid: string, device_id: number, _is_prekey: boolean, value: Uint8Array): Uint8Array;
    decrypt_payload(ciphertext: Uint8Array, iv: Uint8Array, key_and_tag: Uint8Array): Uint8Array;
    /**
     * Encrypt a 32-byte payload key for a recipient device.  If no session exists
     * yet, `bundle` must contain the recipient's OMEMO bundle.
     */
    encrypt_key(jid: string, device_id: number, bundle_js: any, key: Uint8Array): any;
    encrypt_payload(plaintext: Uint8Array): any;
    /**
     * Load a previously serialized store.
     */
    static load(device_id: number, data: Uint8Array): OmemoCrypto;
    constructor(device_id: number);
    refill_prekeys(): void;
    rotate_signed_prekey(): void;
    serialize(): Uint8Array;
    readonly device_id: number;
}

export function start(): void;

export type InitInput = RequestInfo | URL | Response | BufferSource | WebAssembly.Module;

export interface InitOutput {
    readonly memory: WebAssembly.Memory;
    readonly __wbg_omemocrypto_free: (a: number, b: number) => void;
    readonly omemocrypto_bundle: (a: number) => [number, number, number];
    readonly omemocrypto_decrypt_key: (a: number, b: number, c: number, d: number, e: number, f: number, g: number) => [number, number, number, number];
    readonly omemocrypto_decrypt_payload: (a: number, b: number, c: number, d: number, e: number, f: number, g: number) => [number, number, number, number];
    readonly omemocrypto_device_id: (a: number) => number;
    readonly omemocrypto_encrypt_key: (a: number, b: number, c: number, d: number, e: any, f: number, g: number) => [number, number, number];
    readonly omemocrypto_encrypt_payload: (a: number, b: number, c: number) => [number, number, number];
    readonly omemocrypto_load: (a: number, b: number, c: number) => [number, number, number];
    readonly omemocrypto_new: (a: number) => number;
    readonly omemocrypto_refill_prekeys: (a: number) => void;
    readonly omemocrypto_rotate_signed_prekey: (a: number) => void;
    readonly omemocrypto_serialize: (a: number) => [number, number, number, number];
    readonly start: () => void;
    readonly __wbindgen_malloc: (a: number, b: number) => number;
    readonly __wbindgen_realloc: (a: number, b: number, c: number, d: number) => number;
    readonly __wbindgen_exn_store: (a: number) => void;
    readonly __externref_table_alloc: () => number;
    readonly __wbindgen_externrefs: WebAssembly.Table;
    readonly __wbindgen_free: (a: number, b: number, c: number) => void;
    readonly __externref_table_dealloc: (a: number) => void;
    readonly __wbindgen_start: () => void;
}

export type SyncInitInput = BufferSource | WebAssembly.Module;

/**
 * Instantiates the given `module`, which can either be bytes or
 * a precompiled `WebAssembly.Module`.
 *
 * @param {{ module: SyncInitInput }} module - Passing `SyncInitInput` directly is deprecated.
 *
 * @returns {InitOutput}
 */
export function initSync(module: { module: SyncInitInput } | SyncInitInput): InitOutput;

/**
 * If `module_or_path` is {RequestInfo} or {URL}, makes a request and
 * for everything else, calls `WebAssembly.instantiate` directly.
 *
 * @param {{ module_or_path: InitInput | Promise<InitInput> }} module_or_path - Passing `InitInput` directly is deprecated.
 *
 * @returns {Promise<InitOutput>}
 */
export default function __wbg_init (module_or_path?: { module_or_path: InitInput | Promise<InitInput> } | InitInput | Promise<InitInput>): Promise<InitOutput>;
