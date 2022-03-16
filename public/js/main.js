const $deletePost = document.querySelector('[data-delete]')

function remove(el) {
    var element = el;
    element.remove();
}

$deletePost.addEventListener('click', async (e) => {
    if (e.target.dataset.action) {
        const parent = e.target.closest('[data-id]')
        const parentId = e.target.closest('[data-id]').dataset.id
        const response = await fetch('/post', {
            method: "DELETE",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                action: e.target.dataset.action
            })
        })

        if (response.status === 200) {
            parent.remove()
        }
        if (response.status === 403) {
            alert('You are not allowed to do this')
        }
    }
})
