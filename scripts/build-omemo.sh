#!/bin/sh
# Build the Rust OMEMO WASM module and generate wasm-bindgen bindings.
# Run from services/frontend.

set -e

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
CRATE="$ROOT/omemo"
OUTDIR="$ROOT/src/lib/jabber/omemo/wasm"
WASM_BINDGEN_ROOT="$CRATE/.cargo-bin"
WASM_BINDGEN="$WASM_BINDGEN_ROOT/bin/wasm-bindgen"

if ! command -v cargo >/dev/null 2>&1; then
  echo "Error: cargo not found. Install Rust first."
  exit 1
fi

if [ ! -x "$WASM_BINDGEN" ]; then
  echo "Installing wasm-bindgen-cli locally..."
  cargo install wasm-bindgen-cli --version 0.2.123 --root "$WASM_BINDGEN_ROOT"
fi

cd "$CRATE"

echo "Building freenit-omemo WASM module..."
cargo build --target wasm32-unknown-unknown --release

echo "Generating wasm-bindgen bindings..."
mkdir -p "$OUTDIR"
"$WASM_BINDGEN" \
  --target web \
  --out-dir "$OUTDIR" \
  "target/wasm32-unknown-unknown/release/freenit_omemo.wasm"

echo "Done: $OUTDIR/freenit_omemo.js"
echo "      $OUTDIR/freenit_omemo_bg.wasm"
