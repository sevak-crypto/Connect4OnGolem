import {
    LITTLE_ENDIAN as LE,
    bytes as by,
    u16, u32, u64,
    toU16, toU32, toU64,
} from "./types";

export const SGX_FLAGS_INITTED = 0x0000_0001;
export const SGX_FLAGS_DEBUG = 0x0000_0002;
export const SGX_FLAGS_MODE64BIT = 0x0000_0004;
export const SGX_FLAGS_PROVISION_KEY = 0x0000_0010;
export const SGX_FLAGS_EINITTOKEN_KEY = 0x0000_0020;
export const SGX_FLAGS_KSS = 0x0000_0080;
export const SGX_FLAGS_RESERVED = !(
      SGX_FLAGS_INITTED
    | SGX_FLAGS_DEBUG
    | SGX_FLAGS_MODE64BIT
    | SGX_FLAGS_PROVISION_KEY
    | SGX_FLAGS_EINITTOKEN_KEY
    | SGX_FLAGS_KSS
);

// XSAVE feature request mask
export const SGX_XFRM_LEGACY = 0x0000_0003;
export const SGX_XFRM_AVX = 0x0000_0006;
export const SGX_XFRM_AVX512 = 0x0000_00E6;
export const SGX_XFRM_MPX = 0x0000_0018;
export const SGX_XFRM_RESERVED = !(SGX_XFRM_LEGACY | SGX_XFRM_AVX);

export const ENCLAVE_FLAGS_NEEDED: u64 = toU64(SGX_FLAGS_INITTED | SGX_FLAGS_MODE64BIT);

const SZ_SGX_REPORT_DATA: number = 64;
const SZ_SGX_REPORT_BODY: number = 320 + SZ_SGX_REPORT_DATA;
const SZ_SGX_QUOTE_BODY: number = 48 + SZ_SGX_REPORT_BODY;

/// Extended SSA frame feature select (future functional extensions).
export type SgxMiscSelect = u32;
/// Cryptographic key. Usually AES-128-GCM.
export type SgxKey = by.Bytes16;
/// Cryptographic key id (derivation material).
export type SgxKeyId = by.Bytes32;
/// ISV security version number.
export type SgxIsvSvn = u16;
/// Config security version number (KSS only).
export type SgxConfigSvn = u16;
/// Config ID (KSS only).
export type SgxConfigId = by.Bytes64;
/// CPU security version number.
export type SgxCpuSvn = by.Bytes16;
/// Service Provider ID (EPID attestation).
export type SgxSpid = by.Bytes16;
/// Quote basename (SPID for EPID quotes).
export type SgxBasename = by.Bytes32;
/// EPID group ID.
export type SgxEpidGroupId = by.Bytes4;
/// Product ID.
export type SgxProdId = u16;
/// ISV extended product ID.
export type SgxIsvExtProdId = by.Bytes16;
/// ISV family ID.
export type SgxIsvFamilyId = by.Bytes16;
/// Enclave cryptographic measurement.
export type SgxMeasurement = by.Bytes32;
/// MAC (AES-128-CMAC) data.
export type SgxMac = by.Bytes16;
/// Custom data in enclave report.
export type SgxReportData = by.Bytes64;

export const parse_measurement = (hex: string): SgxMeasurement => by.Bytes32.fromHex(hex);

/// Enclave quote.
export class SgxQuote {
    private constructor(
        /// Quote body.
        public body: SgxQuoteBody,
        /// The whole quote serialized.
        public bytes: Uint8Array,
        /// Quote signature (absent in quotes embedded in IAS reports).
        public signature?: Uint8Array,
    ) {}

    static from(bytes: Uint8Array): SgxQuote {
        let body = SgxQuoteBody.from(bytes);
        let quote = new SgxQuote(body, bytes);

        if (bytes.byteLength == SZ_SGX_QUOTE_BODY) {
            return quote;
        } else if (bytes.byteLength < SZ_SGX_QUOTE_BODY + 4) {
            throw new Error("Invalid quote body signature length");
        }

        let view = new DataView(bytes.buffer, 0);
        let off = SZ_SGX_QUOTE_BODY;

        let sig_sz = view.getUint32(off, LE);
        off += 4;
        if (bytes.byteLength != SZ_SGX_QUOTE_BODY + 4 + sig_sz) {
            throw new Error("Invalid quote body signature size");
        }

        quote.signature = Uint8Array.from(bytes.slice(off, off + sig_sz));
        return quote;
    }

    static default(): SgxQuote {
        return new SgxQuote(
            SgxQuoteBody.default(),
            new Uint8Array(0),
        );
    }
}

/// Enclave quote body.
export class SgxQuoteBody {
    constructor(
        /// Quote version.
        public version: u16,
        /// Quote sign type.
        public sign_type: u16,
        /// EPID group ID of the platform.
        public epid_group_id: SgxEpidGroupId,
        /// Quoting Enclave's SVN.
        public qe_svn: SgxIsvSvn,
        /// Provisioning Certification Enclave's SVN.
        public pce_svn: SgxIsvSvn,
        /// Extended EPID group ID of the platform.
        public xeid: u32,
        /// Quote basename.
        public basename: SgxBasename,
        /// Cryptographic report of the enclave.
        public report_body: SgxReportBody,
    ) {}

    static from(bytes: Uint8Array): SgxQuoteBody {
        // IAS quotes lack the `signature_len` and `signature` fields (they are SgxQuoteBody).
        if (bytes.byteLength < SZ_SGX_QUOTE_BODY) {
            throw new Error("Invalid quote body size");
        }

        let body = Object.create(this.prototype);
        let view = new DataView(bytes.buffer, 0);
        let off: number = 0;

        body.version = toU16(view.getUint16(off, LE));
        off += 2;
        body.sign_type = toU16(view.getUint16(off, LE));
        off += 2;
        body.epid_group_id = by.Bytes4.from(bytes, off);
        off += by.Bytes4.size;
        body.qe_svn = toU16(view.getUint16(off, LE));
        off += 2;
        body.pce_svn = toU16(view.getUint16(off, LE));
        off += 2;
        body.xeid = toU32(view.getUint32(off, LE));
        off += 4;
        body.basename = by.Bytes32.from(bytes, off);
        off += by.Bytes32.size;
        body.report_body = SgxReportBody.from(bytes.slice(off));

        return body;
    }

    static default(): SgxQuoteBody {
        return new SgxQuoteBody(
            toU16(0),
            toU16(0),
            by.Bytes4.default(),
            toU16(0),
            toU16(0),
            toU32(0),
            by.Bytes32.default(),
            SgxReportBody.default(),
        );
    }
}

/// Cryptographic enclave report.
/// Layout of this struct up to the `bytes` field matches `sgx_report_t` from the SGX SDK.
export interface SgxReport {
    /// Report body.
    body: SgxReportBody;
    /// Report key ID.
    key_id: SgxKeyId;
    /// AES-128 CMAC of `body`.
    mac: SgxMac;
    /// Previous fields serialized.
    bytes: Uint8Array;
}

/// Body of the cryptographic enclave report.
/// Layout of this struct matches `sgx_report_body_t` from the SGX SDK.
export class SgxReportBody {
    constructor(
        /// CPU security version number
        public cpu_svn: SgxCpuSvn,
        /// Misc select of the enclave
        public misc_select: SgxMiscSelect,
        /// Reserved
        public reserved1: by.Bytes12,
        /// ISV extended product ID of the enclave
        public isv_ext_prod_id: SgxIsvExtProdId,
        /// Attributes of the enclave
        public attributes: SgxAttributes,
        /// Hash of the enclave
        public mr_enclave: SgxMeasurement,
        /// Reserved
        public reserved2: by.Bytes32,
        /// Hash of the public key that signed the enclave
        public mr_signer: SgxMeasurement,
        /// Reserved
        public reserved3: by.Bytes32,
        /// Config ID of the enclave
        public config_id: SgxConfigId,
        /// ISV product ID of the enclave
        public isv_prod_id: SgxProdId,
        /// ISV security version number of the enclave
        public isv_svn: SgxIsvSvn,
        /// Config SVN of the enclave
        public config_svn: SgxConfigSvn,
        /// Reserved
        public reserved4: by.Bytes42,
        /// ISV family ID of the enclave
        public isv_family_id: SgxIsvFamilyId,
        /// Custom data specified by the enclave
        public report_data: SgxReportData,
    ) {}

    static from(bytes: Uint8Array): SgxReportBody {
        if (bytes.byteLength < SZ_SGX_REPORT_BODY) {
            throw new Error("Invalid report body size")
        }

        let body = Object.create(this.prototype);
        let view = new DataView(bytes.buffer, 0);
        let off: number = 0;

        body.cpu_svn = by.Bytes16.from(bytes, off);
        off += by.Bytes16.size;
        body.misc_select = toU32(view.getUint32(off));
        off += 4;
        body.reserved1 = by.Bytes12.from(bytes, off);
        off += by.Bytes12.size;
        body.isv_ext_prod_id = by.Bytes16.from(bytes, off);
        off += by.Bytes16.size;

        let flags = toU64(bytes.slice(off, off + 8));
        off += 8;
        let xfrm = toU64(bytes.slice(off, off + 8));
        off += 8;
        body.attributes = {
            flags: flags,
            xfrm: xfrm,
        };

        body.mr_enclave = by.Bytes32.from(bytes, off);
        off += by.Bytes32.size;
        body.reserved2 = by.Bytes32.from(bytes, off);
        off += by.Bytes32.size;
        body.mr_signer = by.Bytes32.from(bytes, off);
        off += by.Bytes32.size;
        body.reserved3 = by.Bytes32.from(bytes, off);
        off += by.Bytes32.size;
        body.config_id = by.Bytes64.from(bytes, off);
        off += by.Bytes64.size;
        body.isv_prod_id = view.getUint16(off, LE);
        off += 2;
        body.isv_svn = view.getUint16(off, LE);
        off += 2;
        body.config_svn = view.getUint16(off, LE);
        off += 2;
        body.reserved4 = by.Bytes42.from(bytes, off);
        off += by.Bytes42.size;
        body.isv_family_id = by.Bytes16.from(bytes, off);
        off += by.Bytes16.size;
        body.report_data = by.Bytes64.from(bytes, off);
        off += by.Bytes64.size;

        return body;
    }

    static default(): SgxReportBody {
        return new SgxReportBody(
            by.Bytes16.default(),
            toU32(0),
            by.Bytes12.default(),
            by.Bytes16.default(),
            {
                flags: toU64(0),
                xfrm: toU64(0),
            },
            by.Bytes32.default(),
            by.Bytes32.default(),
            by.Bytes32.default(),
            by.Bytes32.default(),
            by.Bytes64.default(),
            toU16(0),
            toU16(0),
            toU16(0),
            by.Bytes42.default(),
            by.Bytes16.default(),
            by.Bytes64.default()
        );
    }
}

/// Enclave attributes.
export interface SgxAttributes {
    /// Enclave flags.
    flags: u64,
    /// XSAVE feature request mask.
    xfrm: u64,
}

/// Enclave misc select and attributes.
export interface SgxMiscAttribute {
    /// Enclave attributes.
    secs_attr: SgxAttributes,
    /// Enclave misc select flags.
    misc_select: SgxMiscSelect,
}

/// Information specifying the target enclave for quote generation.
/// Layout of this struct up to the `bytes` field matches `sgx_target_info_t` from the SGX SDK.
export interface SgxTargetInfo {
    /// MR_ENCLAVE of the target enclave.
    mr_enclave: SgxMeasurement;
    /// Attributes of the target enclave.
    attributes: SgxAttributes;
    /// Reserved, must be zero.
    reserved1: by.Bytes2;
    /// Config SVN of the target enclave.
    config_svn: SgxConfigSvn;
    /// Misc select of the target enclave.
    misc_select: SgxMiscSelect;
    /// Reserved, must be zero.
    reserved2: by.Bytes8;
    /// Config ID of the target enclave.
    config_id: SgxConfigId;
    /// Reserved, must be zero.
    reserved3: by.Bytes384;
    /// Previous fields serialized.
    bytes: Uint8Array;
}
