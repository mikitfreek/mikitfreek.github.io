const pre = document.querySelector('.preloader');

document.addEventListener('readystatechange', e => {
    if (e.target.readyState === 'interactive') {
        console.log('loading');
    }
    else if (e.target.readyState === 'complete') {
        pre.classList.add('visuallyhidden');    
        // pre.addEventListener('transitionend', e => {
        //     pre.classList.add('hidden');
        //     }, {
        //     capture: false,
        //     once: true,
        //     passive: false
        // });
        setTimeout(function () {
            pre.classList.add('hidden');
        }, 700);
    }
});