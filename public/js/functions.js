function array_contains (a, b) {
    for (var c in a) {
        if (a[c]===b) {
            return true;
        }
    }

    return false;
}

