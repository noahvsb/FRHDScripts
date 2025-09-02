public enum PixelColor {
    WHITE(0, "WHITE"), BLACK(1, "BLACK"), GRAY(2, "GRAY");

    private int n;
    private String s;

    private PixelColor(int n, String s) {
        this.n = n;
        this.s = s;
    }

    public int get() {
        return n;
    }

    public String toString() {
        return s;
    }
}
