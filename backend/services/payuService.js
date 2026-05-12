import crypto from 'crypto';

/**
 * Generates Hash for PayU payment initialization
 * Format: sha512(key|txnid|amount|productinfo|firstname|email|udf1|udf2|udf3|udf4|udf5||||||SALT)
 */
export const generatePayUHash = (params) => {
    const { key, salt, txnid, amount, productinfo, firstname, email, udf1 = "", udf2 = "", udf3 = "", udf4 = "", udf5 = "" } = params;
    
    const hashString = `${key}|${txnid}|${amount}|${productinfo}|${firstname}|${email}|${udf1}|${udf2}|${udf3}|${udf4}|${udf5}||||||${salt}`;
    
    const hash = crypto.createHash('sha512').update(hashString).digest('hex');
    return hash;
};

/**
 * Verifies Return Hash sent by PayU
 * Format: sha512(SALT|status||||||udf5|udf4|udf3|udf2|udf1|email|firstname|productinfo|amount|txnid|key)
 */
export const verifyPayUResponseHash = (params, salt) => {
    const { status, udf5 = "", udf4 = "", udf3 = "", udf2 = "", udf1 = "", email, firstname, productinfo, amount, txnid, key, additionalcharges } = params;
    
    let hashString = "";
    if (additionalcharges) {
        hashString = `${additionalcharges}|${salt}|${status}||||||${udf5}|${udf4}|${udf3}|${udf2}|${udf1}|${email}|${firstname}|${productinfo}|${amount}|${txnid}|${key}`;
    } else {
        hashString = `${salt}|${status}||||||${udf5}|${udf4}|${udf3}|${udf2}|${udf1}|${email}|${firstname}|${productinfo}|${amount}|${txnid}|${key}`;
    }
    
    const expectedHash = crypto.createHash('sha512').update(hashString).digest('hex');
    return expectedHash === params.hash;
};
