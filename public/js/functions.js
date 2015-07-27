function array_contains(arr, value) {
    for (var k in arr) {
        if (arr[k] === value) {
            return true;
        }
    }

    return false;
}