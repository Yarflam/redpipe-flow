import { exec } from 'child_process';

function bashExec(cmd, verbose=false, showErrors=false) {
    return new Promise(resolve => {
        if (verbose) console.log(`#> ${cmd}`);
        exec(cmd, (err, stdout, stderr) => {
            let json = { success: false, error: stderr, data: null };
            if (err) {
                json.code = err.code;
                if (showErrors) {
                    if (!verbose) console.log(`#> ${cmd}`); // no repeat
                    console.log(stderr);
                } else if (verbose) console.log(stderr);
            } else {
                json.success = true;
                json.data = stdout;
                if (verbose) console.log(stdout);
            }
            resolve(json);
        });
    });
}

export default bashExec;