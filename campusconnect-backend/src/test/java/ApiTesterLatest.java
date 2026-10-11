import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.net.HttpURLConnection;
import java.net.URL;
import java.io.InputStreamReader;
import java.io.BufferedReader;

public class ApiTesterLatest {
    public static void main(String[] args) throws Exception {
        String secret = "campus0connect0super0secret0key0change0this";
        Map<String, Object> claims = new HashMap<>();
        claims.put("userId", 1L);
        claims.put("role", "CLUB_ADMIN");
        claims.put("collegeId", 1L);

        String token = Jwts.builder()
                .setClaims(claims)
                .setSubject("1")
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + 86400000))
                .signWith(Keys.hmacShaKeyFor(secret.getBytes()))
                .compact();

        String urlStr = "http://localhost:8080/campus-connect/clubs/1/admin/top-announcements";
        System.out.println("GET " + urlStr);
        URL url = new URL(urlStr);
        HttpURLConnection con = (HttpURLConnection) url.openConnection();
        con.setRequestMethod("GET");
        con.setRequestProperty("Authorization", "Bearer " + token);
        int status = con.getResponseCode();
        System.out.println("Status: " + status);
        BufferedReader in = new BufferedReader(new InputStreamReader(status >= 400 ? con.getErrorStream() : con.getInputStream()));
        String line;
        while ((line = in.readLine()) != null) {
            System.out.println(line);
        }
        in.close();
    }
}
