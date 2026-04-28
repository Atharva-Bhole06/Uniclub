import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.ResultSet;
import java.sql.Statement;

public class CheckDB {
    public static void main(String[] args) {
        try {
            Connection conn = DriverManager.getConnection("jdbc:mysql://localhost:3306/uniclub", "root", "123456");
            Statement stmt = conn.createStatement();
            ResultSet rs = stmt.executeQuery("SELECT email, password FROM users WHERE email='riya@apsit.edu.in'");
            if (rs.next()) {
                System.out.println("EMAIL: " + rs.getString("email"));
                System.out.println("PASSWORD_HASH: " + rs.getString("password"));
            } else {
                System.out.println("User riya@apsit.edu.in not found!");
            }
            conn.close();
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
