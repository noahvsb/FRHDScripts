public class Encoding {
    public static String encodeLine(int x1, int y1, int x2, int y2) {
        return Integer.toString(x1, 32) + " " + Integer.toString(y1, 32) +
                " " + Integer.toString(x2, 32) + " " + Integer.toString(y2, 32) + ",";
    }
}
