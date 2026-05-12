/**
 * Dynamically constructs a hidden HTML form and auto-posts it to PayU Gateway
 */
export const redirectToPayU = (params: any) => {
    const form = document.createElement('form');
    form.method = 'POST';
    form.action = params.action; // Usually https://secure.payu.in/_payment or test url

    // Add all essential PayU params
    const payload = {
        key: params.key,
        txnid: params.txnid,
        amount: params.amount,
        productinfo: params.productinfo,
        firstname: params.firstname,
        email: params.email,
        phone: params.phone,
        surl: params.surl,
        furl: params.furl,
        hash: params.hash,
        udf1: params.udf1 || ""
    };

    Object.entries(payload).forEach(([key, value]) => {
        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = key;
        input.value = value as string;
        form.appendChild(input);
    });

    document.body.appendChild(form);
    form.submit();
    document.body.removeChild(form);
};
